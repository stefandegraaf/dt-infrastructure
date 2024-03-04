import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getFresnelMaterial } from '../materials/fresnel-material';
import gsap from 'gsap';
import { createParticles } from '../objects/erratic-points';
import type { Writable } from 'svelte/store';
import { earthDots, earthWireFrame } from '../objects/earth-objects';


class RaycasterBase {

	private raycaster: THREE.Raycaster = new THREE.Raycaster();
	private mouse: THREE.Vector2 = new THREE.Vector2();
	private mouseIsOnCanvas: boolean = false;

	constructor(canvas: HTMLElement) {
		const rect = canvas.getBoundingClientRect();
		canvas.addEventListener('mousemove', (event) => {
			if (!this.mouseIsOnCanvas) return;
			this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;		
		}, false);

		canvas.addEventListener('mouseenter', () => {
			this.mouseIsOnCanvas = true;
		});
		canvas.addEventListener('mouseleave', () => {
			this.mouseIsOnCanvas = false;
		});
	}

	public checkIntersection(object: THREE.Object3D, camera: THREE.PerspectiveCamera): boolean {
		if (!this.mouseIsOnCanvas) return false;
		this.raycaster.setFromCamera(this.mouse, camera);
		const intersects = this.raycaster.intersectObject(object, true);
		return intersects.length > 0;
	}

}

export class HeaderRender {
	public canvas: HTMLElement;
	public scene: THREE.Scene;
	public camera: THREE.PerspectiveCamera;
	protected renderer: THREE.WebGLRenderer;
	protected animationFrame: number | undefined;

	private observer: IntersectionObserver;
	private isIntersecting: boolean = true;

	private raycaster: RaycasterBase;

	private ready: boolean = false;
	private state: number = 0;

	constructor(canvas: HTMLElement, startAnimationProgress: Writable<number>) {
		this.canvas = canvas;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;
		
		this.raycaster = new RaycasterBase(this.canvas);

		this.observer = new IntersectionObserver((entries) => {
			this.isIntersecting = entries[0].isIntersecting;
		}, {});
		this.observer.observe(this.canvas);

		this.render(6);

		this.camera.position.set(-1, 5, 70);
		this.camera.lookAt(-5, 0, 0);
		let tween = gsap.to(this.camera.position, {
			z: 7,
			duration: 5,
			ease: "power2.out",
			onUpdate: () => {
				this.camera.lookAt(-5, 0, 0);
				startAnimationProgress.set(tween.progress());
			},
			onComplete: () => {
				this.ready = true;
			}
		});
	}

	public destroy(): void {
		cancelAnimationFrame(this.animationFrame as number);
		this.renderer?.dispose();
		this.observer?.disconnect();
	}

	
	public render(size: number): void {
		//new OrbitControls(this.camera, this.canvas);

		const stars = createParticles(300, 0.6, 60, 40);
		const starsMaterial = stars.particleMaterial;
		this.scene.add(stars.particles);

		const geometry = new THREE.IcosahedronGeometry(size, 12);
		const loader = new THREE.TextureLoader();
		const normalMap = loader.load("./src/lib/files/textures/earth_normal_1080x540.png");
		const earthTexture = loader.load("./src/lib/files/textures/8k_earth_daymap.jpg");
		earthTexture.colorSpace = THREE.SRGBColorSpace;
		const material = new THREE.MeshStandardMaterial({
			map: earthTexture,
			normalMap: normalMap,
			transparent: true
		});
		const earth = new THREE.Mesh(geometry, material);
		this.scene.add(earth);

		// Create the moon
		const segments = size * 5;
        const moonGeometry = new THREE.SphereGeometry(size / 4, segments, segments);
        const moonTexture = new THREE.TextureLoader().load("https://www.shutterstock.com/image-photo/textured-surface-moon-earths-satellite-260nw-1701426850.jpg");
		const moonNormalMap = new THREE.TextureLoader().load("https://static.turbosquid.com/Preview/2020/02/10__12_15_26/The_Moon_Normal_Map_Cover_000.jpg3B67A625-1ED4-42EC-89CF-71DBFF106E25Large.jpg");
        const moonMaterial = new THREE.MeshStandardMaterial({
			map: moonTexture,
			normalMap: moonNormalMap
			
		});
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
		//this.scene.add(moon);
        moon.position.set(25, 0, 0);

		//this.light = new THREE.HemisphereLight(0xffffff, 0x000000, 3);
		const sunPosition = new THREE.Vector3(-2, 0.5, 1.5).normalize();
		const light = new THREE.DirectionalLight(0xffffff, 1.0);
		light.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
		this.scene.add(light);

		/*
		const lightsMa2t = new THREE.MeshBasicMaterial({ 
			map: loader.load('./src/lib/files/textures/8k_earth_nightmap.jpg'),
			blending: THREE.AdditiveBlending,
			transparent: true,
			opacity: 1
		});
		const nightTexture = loader.load('./src/lib/files/textures/8k_earth_nightmap.jpg');
		nightTexture.colorSpace = THREE.SRGBColorSpace;
		const lightsMat = new THREE.ShaderMaterial({
			uniforms: {
				textureMap: { value: nightTexture },
				sunDirection: { value: sunPosition }, // Adjust this to the actual sun direction
				cameraPosition: { value: this.camera.position } // Pass the camera position
			},
			vertexShader: `
				varying vec2 vUv;
				varying vec3 vSunDirection;
				varying float vOpacity;
				uniform vec3 sunPosition;
				void main() {
					vUv = uv;
					vec3 vNormal = normalize(normalMatrix * normal);
					vec4 worldPosition = modelMatrix * vec4(position, 1.0);
					vSunDirection = normalize(sunPosition - worldPosition.xyz); // Calculate the sun direction
					vOpacity = max(dot(vNormal, vSunDirection), 0.0);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform sampler2D textureMap;
				varying vec2 vUv;
				varying float vOpacity;
				void main() {
					vec4 texColor = texture2D(textureMap, vUv);
					gl_FragColor = vec4(texColor.rgb, vOpacity);
				}
			`,
			blending: THREE.AdditiveBlending
		});
		const lightsMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size + 0.01, 12), lightsMat);
		this.scene.add(lightsMesh);
		//let helper = new VertexNormalsHelper(lightsMesh, 2, 0x00ff00);
		//this.earth.add(helper);
		*/

		const cloudTexture = loader.load('./src/lib/files/textures/8k_earth_clouds.jpg');
		cloudTexture.colorSpace = THREE.SRGBColorSpace;
		const cloudMat = new THREE.MeshStandardMaterial({
			map: loader.load('./src/lib/files/textures/8k_earth_clouds.jpg'),
			blending: THREE.AdditiveBlending,
			transparent: true
		});
		const clouds = new THREE.Mesh(new THREE.IcosahedronGeometry(size + 0.01, 12), cloudMat);
		this.scene.add(clouds);

		const fresnelMat = getFresnelMaterial({rimHex: 0x00aaff, facingHex: 0x0088ff});
		const fresnelMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size + 0.09, 12), fresnelMat);
		this.scene.add(fresnelMesh);



// Space background
		/*
		const digitalEarth = loader.load('./src/lib/files/textures/digital_earth.jpg');
		digitalEarth.colorSpace = THREE.SRGBColorSpace;
		const digitalEarthMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		const digitalEarthMesh = new THREE.Mesh(geometry, digitalEarthMat);
		this.scene.add(digitalEarthMesh);
		digitalEarthMesh.position.z -= 1;
		digitalEarthMesh.position.x -= 0.2;
		*/


		const ed = earthDots(size, 32000);
		const dots = ed.points;
		const dotsMaterial = ed.material;
		dots.visible = false;
		this.scene.add(dots);

		
		const wf = earthWireFrame(size);
		const wireframeMesh = wf.mesh;
		const wireframeShaderMaterial = wf.material;
		wireframeMesh.visible = false;
		this.scene.add(wireframeMesh);

		const setState = (newState: number) => {
			this.state = newState;
			const duration = 1.0;
			
			earth.visible = true;
			gsap.to(earth.material, {
				opacity: this.state === 0 ? 1.0 : 0.0,
				duration: duration,
				ease: "power2.out",
				onComplete: () => {
					earth.visible = this.state === 0;
				}
			});

			clouds.visible = true;
			gsap.to(clouds.material, {
				opacity: this.state === 0 ? 1.0 : 0.0,
				duration: 0,
				ease: "power2.out",
				onComplete: () => {
					clouds.visible = this.state === 0;
				}
			});

			gsap.to(fresnelMat, {
				opacity: this.state === 0 ? 1.0 : 0.0,
				duration: duration,
				ease: "power2.out",

			});

			moon.visible = true;
			gsap.to(moon.material, {
				opacity: this.state === 0 ? 1.0 : 0.0,
				duration: 5.0,
				ease: "power2.out",
				onComplete: () => {
					moon.visible = this.state === 0;
				}
			});

			stars.particles.visible = true;
			gsap.to(starsMaterial.uniforms.progress, {
				value: this.state === 0 ? 1.0 : 0.0,
				duration: 0,
				ease: "power2.out",
				onComplete: () => {
					stars.particles.visible = this.state === 0;
				}
			});
			
			dots.visible = true;
			gsap.to(dotsMaterial.uniforms.u_opacity, {
				value: this.state === 1 ? 1.0 : 0.0,
				duration: duration,
				ease: "power2.out",
				overwrite: true,
				onUpdate: () => {
					dotsMaterial.needsUpdate = true;
				},
				onComplete: () => {
					dots.visible = this.state === 1;
				}
			});

			wireframeMesh.visible = true;
			gsap.to(wireframeShaderMaterial.uniforms.u_opacity, {
				value: this.state === 1 ? 1.0 : 0.0,
				duration: duration,
				ease: "power2.out",
				overwrite: true,
				onUpdate: () => {
					console.log(wireframeShaderMaterial.uniforms.u_opacity.value)
					//wireframeShaderMaterial.needsUpdate = true;
				},
				onComplete: () => {
					wireframeMesh.visible = this.state === 1;
				}
			});

			if (this.ready)  {
				gsap.to(this.camera.position, {
					x: this.state === 0 ? -1 : 0.5,
					y: this.state === 0 ? 5 : 6,
					z: this.state === 0 ? 7 : 8,
					duration: duration,
					ease: "power2.out"
				});
			}
		}
	


		const renderLoop = () => {
			this.animationFrame = requestAnimationFrame(renderLoop);
			
			if (this.isIntersecting) {
				wireframeShaderMaterial.uniforms.u_time.value = performance.now() / 1200; // time in seconds
				starsMaterial.uniforms.progress.value = Math.abs(Math.sin(performance.now() / 13000));
				stars.particles.rotation.y += 0.0001;

				earth.rotation.y += 0.00025;
				clouds.rotation.y += 0.0002;
				dots.rotation.y += 0.00025;
				wireframeMesh.rotation.z += 0.0001;

				moon.rotation.y += 0.001;
				const angle = -Date.now() / 6000;
				const radius = 25;
				const incline = Math.PI / 36; // 5 degrees
				moon.position.x = radius * Math.cos(angle);
				moon.position.y = radius * Math.sin(incline) * Math.sin(angle);
				moon.position.z = radius * Math.cos(incline) * Math.sin(angle);

				//digitalEarthMesh.position.z += 0.003;
				//digitalEarthMesh.position.x -= 0.001;
				const state = this.state;
				const mouseOnEarth = this.raycaster.checkIntersection(fresnelMesh, this.camera);
				if (mouseOnEarth) {
					this.state = 1;
				} else {
					this.state = 0;
				}
				if (state !== this.state) {
					setState(this.state);
				}

				this.renderer.render(this.scene, this.camera);
			}
		}
		renderLoop();
	}
		
}