import * as THREE from 'three';
import gsap from 'gsap';

import type { RenderHandler } from "../render-handler";
import { getFresnelMaterial } from '../materials/fresnel-material.js';
import { ThreeRenderAbstract } from './render-base';
import { earthSpiralDots, earthWireFrame } from '../objects/earth-objects';
import { animateCamera } from '../gsap-helpers';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';



export class EarthRender extends ThreeRenderAbstract {

	private earth!: THREE.Group;
	private clouds!: THREE.Mesh;
	private fresnel!: THREE.Mesh;
	private moon!: THREE.Mesh;
	private dottedSurface!: THREE.Points;
	private wireframe!: THREE.LineSegments;
	private light!: THREE.DirectionalLight;

	private dotsMaterial!: THREE.ShaderMaterial;
	private wireframeMaterial!: THREE.ShaderMaterial;

	private size: number = 1000;
	private fading = false;
	private opacity = 1.0;

	constructor(renderer: RenderHandler, start: number, end: number) {
		super(renderer, start, end);
		this.construct();
		this.renderer.progressWritable.subscribe((progress) => {
			if (progress >= this.start - 0.99 && progress < this.end - 0.01) {
				if (!this.added) this.add();
			} else {
				if (this.added) this.dispose();
			}
		});
		this.renderer.selectedIndex.subscribe((step) => {
			this.onStepChange(step);
		});
	}

	addToScene(): void {
		this.renderer.scene.add(this.earth);
		this.renderer.scene.add(this.fresnel);
		this.renderer.scene.add(this.moon);
		this.renderer.scene.add(this.dottedSurface);
		this.renderer.scene.add(this.wireframe);
		this.renderer.scene.add(this.light);
	}

	disposeFromScene(): void {
		this.renderer.scene.remove(this.earth);
		this.renderer.scene.remove(this.fresnel);
		this.renderer.scene.remove(this.moon);
		this.renderer.scene.remove(this.dottedSurface);
		this.renderer.scene.remove(this.wireframe);
		this.renderer.scene.remove(this.light);
	}

	onStepChange(progress: number) {
		if (progress === 1) {
			this.setRealistic();
			animateCamera({
				position: new THREE.Vector3(-this.size * 0.8, this.size, this.size * 1.24), 
				lookAt: new THREE.Vector3(-this.size * 0.8, 0, 0), 
				camera: this.renderer.camera,
				duration: 4
			});
		} else if (progress === 2) {
			this.setDotted();
			animateCamera({
				position: new THREE.Vector3(-this.size * 0.8, this.size * 0.5, this.size * 1.5), 
				lookAt: new THREE.Vector3(-this.size * 0.6, 0, 0), 
				camera: this.renderer.camera,
				duration: 2
			});
		} else if (progress === 3) {
			this.setDotted();
			animateCamera({
				position: new THREE.Vector3(-this.size * 0.8, this.size * 0.8, this.size * 1.9), 
				lookAt: new THREE.Vector3(-this.size * 0.9, 0, 0), 
				camera: this.renderer.camera,
				duration: 1
			});
		} else if (progress === 4) {
			this.setSpiral();
			animateCamera({
				position: new THREE.Vector3(0, 0, this.size * 1.5), 
				lookAt: new THREE.Vector3(-this.size * 1.2, 0, 0), 
				camera: this.renderer.camera,
				duration: 3
			});
		}
		if (progress > 0 || progress < 5) {
			gsap.to(this.dotsMaterial.uniforms.u_opacity, {
				value: progress === 2 || progress === 3 ? 1.0 : 0.0,
				duration: 3,
				ease: "power2.out"
			});

			gsap.to(this.wireframeMaterial.uniforms.u_opacity, {
				value: progress === 2 || progress === 3 ? 1.0 : 0.0,
				duration: 3,
				ease: "power2.out"
			});
		}
	}


	private setRealistic(): void {
		this.setOpacity(1.0);
		this.fading = false;
		this.earth.visible = true;
		this.moon.visible = true;
		this.fresnel.visible = true;
		this.dottedSurface.visible = false;
		this.wireframe.visible = false;
	}

	private setDotted(): void {
		this.dottedSurface.visible = true;
		this.wireframe.visible = true;
		this.earth.visible = false;
		this.moon.visible = false;
		this.fresnel.visible = true;
		this.fadeEarth();
	}
	
	private setSpiral(): void {
		this.dottedSurface.visible = true;
		this.wireframe.visible = false;
		this.earth.visible = false;
		this.moon.visible = false;
		this.fresnel.visible = false;
		this.fadeEarth();
	}
	
	private fadeEarth(): void {
		this.fading = true;
		setTimeout(() => {
			if (this.fading) {
				this.earth.visible = false;
			}
		}, 1000);
	}

	construct(): void {
		this.earth = new THREE.Group();
		this.earth.position.set(0, 0, 0);
		
		const geometry = new THREE.IcosahedronGeometry(this.size, 12);
		const loader = new THREE.TextureLoader();
		const normalMap = loader.load("https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/earth_normal_1080x540.png");
		const earthTexture = loader.load("https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/2k_earth_daymap.jpg");
		earthTexture.colorSpace = THREE.SRGBColorSpace;
		const material = new THREE.MeshStandardMaterial({
			map: earthTexture,
			normalMap: normalMap
		});
		const earthBasis = new THREE.Mesh(geometry, material);
		this.earth.add(earthBasis);

		// Create the moon
        const moonGeometry = new THREE.SphereGeometry(this.size / 4, 32, 32);
        const moonTexture = loader.load("https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/2k_moon.jpg");
		const moonNormalMap = loader.load("https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/moon_normal_map.jpg");
        const moonMaterial = new THREE.MeshStandardMaterial({
			map: moonTexture,
			normalMap: moonNormalMap
		});
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
        this.moon.position.set(this.size * 10, 0, 0);


		//this.light = new THREE.HemisphereLight(0xffffff, 0x000000, 3);
		const sunPosition = new THREE.Vector3(-2, 0.5, 1.5).normalize();
		this.light = new THREE.DirectionalLight(0xffffff, 1.0);
		this.light.position.set(sunPosition.x, sunPosition.y, sunPosition.z);

		

		const nightTexture = loader.load('https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/2k_earth_nightmap.jpg');
		nightTexture.colorSpace = THREE.SRGBColorSpace;
		
		const lightsMat = new THREE.ShaderMaterial({
			uniforms: {
				textureMap: { value: nightTexture },
				sunPosition: { value: this.light.position },
				cameraPosition: { value: this.renderer.camera.position } 
			},
			vertexShader: `
				varying vec2 vUv;
				varying vec3 vSunDirection;
				varying float vOpacity;
				uniform vec3 sunPosition;

				void main() {
					vUv = uv;
					vec4 worldPosition = modelMatrix * vec4(position, 1.0);
					vOpacity = dot(normalize(worldPosition.xyz), normalize(sunPosition)) * -1.0;
					vOpacity = smoothstep(-0.4, 0.2, vOpacity);
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
		const lightsMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(this.size * 1.001, 12), lightsMat);
		this.earth.add(lightsMesh);
		//let helper = new VertexNormalsHelper(lightsMesh, 20, 0x00ff00);
		//this.earth.add(helper);



		const cloudTexture = loader.load('https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/2k_earth_clouds.jpg');
		cloudTexture.colorSpace = THREE.SRGBColorSpace;
		const cloudMat = new THREE.MeshStandardMaterial({
			map: cloudTexture,
			blending: THREE.AdditiveBlending
		});
		this.clouds = new THREE.Mesh(new THREE.IcosahedronGeometry(this.size * 1.004, 12), cloudMat);
		this.earth.add(this.clouds);

		const fresnelMat = getFresnelMaterial({rimHex: 0x00aaff, facingHex: 0x0088ff});
		const fresnelMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(this.size * 1.009, 12), fresnelMat);
		this.fresnel = fresnelMesh;

		const wf = earthWireFrame(this.size * 1.009);
		this.wireframe = wf.mesh;
		this.wireframeMaterial = wf.material;

		const dots = earthSpiralDots(this.size * 1.009, 32000);
		this.dottedSurface = dots.points;
		this.dotsMaterial = dots.material;

		//this.addStars();

		//this.createDottedSurface();
	}


	private addStars(): void {
		function getRandomSpherePoint(): THREE.Vector3 {
			const radius = Math.random() * 45 + 35;
			const u = Math.random();
			const v = Math.random();
			const theta = 2 * Math.PI * u;
			const phi = Math.acos(2 * v - 1);
			const x = radius * Math.sin(phi) * Math.cos(theta);
			const y = radius * Math.sin(phi) * Math.sin(theta);
			const z = radius * Math.cos(phi);
			return new THREE.Vector3(x, y, z);
		}
		const starsGeometry = new THREE.BufferGeometry();
		const starVertices = [];
		for (let i = 0; i < 1000; i++) {
			const vertex = getRandomSpherePoint();
			starVertices.push(vertex.x, vertex.y, vertex.z);
		}
		starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
		const loader = new THREE.TextureLoader();
		const starsMaterial = new THREE.PointsMaterial({
			vertexColors: true,
			map: loader.load('./src/lib/files/textures/star.png')
		});
		const starField = new THREE.Points(starsGeometry, starsMaterial);
		this.renderer.scene.add(starField);
		
	}

	render() {
		this.renderer.pivot.rotation.y += 0.0001;
		this.earth.rotation.y -= 0.0004;
		this.dottedSurface.rotation.y += 0.0003;
		if (!this.wireframe.visible) this.dottedSurface.rotation.y += 0.0008; // --> Spiral

		this.clouds.rotation.x -= 0.00005;
		this.clouds.rotation.y -= 0.00005;

		const elapsedTime = this.renderer.clock.getElapsedTime();
		const angle = elapsedTime * 0.1;
		const radius = this.size * 10;
		const incline = Math.PI / 36; // 5 degrees
		this.moon.position.x = radius * Math.cos(angle);
		this.moon.position.y = radius * Math.sin(incline) * Math.sin(angle);
		this.moon.position.z = radius * Math.cos(incline) * Math.sin(angle);

		this.light.position.x = radius * Math.cos(angle);
		this.light.position.z = radius * Math.sin(angle);

		this.wireframeMaterial.uniforms.u_time.value = elapsedTime;
		
		if (this.fading) {
			this.setOpacity(this.opacity - 0.004);
		}

		this.dotsMaterial.uniforms.u_time.value = elapsedTime/2;
		this.dotsMaterial.uniforms.u_progress.value = this.renderer.progress.value - 3;
	}

	private setOpacity(opacity: number): void {
		this.opacity = opacity;
		this.earth.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.material.opacity = this.opacity;
			}
		});
		if (this.moon.material instanceof THREE.Material) this.moon.material.opacity = this.opacity;
		this.light.intensity = this.opacity;
	}
}
