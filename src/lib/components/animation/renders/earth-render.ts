import * as THREE from 'three';
import gsap from 'gsap';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import type { RenderHandler } from "../render-handler";
import { getFresnelMaterial } from '../materials/fresnel-material.js';
import { ThreeRenderAbstract } from './render-base';
import { earthDots, earthSpiralDots, earthWireFrame } from '../objects/earth-objects';
import { get } from 'svelte/store';



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
			this.onStepChange(step - this.start);
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
		if (progress === 0) {
			this.setRealistic();
			gsap.to(this.renderer.camera.position, {
				x: 0,
				y: this.size * 1.04,
				z: this.size * 1.04,
				duration: 3,
				ease: "power2.out",
				onUpdate: () => {
					this.renderer.camera.lookAt(0, 0, 0);
				}
			});
		} else if (progress === 1) {
			this.setDotted();
			gsap.to(this.renderer.camera.position, {
				x: 0,
				y: this.size * 1.3,
				z: this.size * 1.3,
				duration: 3,
				ease: "power2.out",
				onUpdate: () => {
					this.renderer.camera.lookAt(0, 0, 0);
				}
			});
		} else if (progress === 2) {
			this.setDotted();
			gsap.to(this.renderer.camera.position, {
				x: 0,
				y: this.size * 1.5,
				z: this.size * 1.5,
				duration: 3,
				ease: "power2.out",
				onUpdate: () => {
					this.renderer.camera.lookAt(0, 0, 0);
				}
			});
		} else if (progress === 3) {
			this.setSpiral();
			gsap.to(this.renderer.camera.position, {
				x: 0,
				y: 0,
				z: this.size *1.5,
				duration: 3,
				ease: "power2.out",
				onUpdate: () => {
					this.renderer.camera.lookAt(-this.size * 1.2, 0, 0);
				}
			});
		}

		gsap.to(this.dotsMaterial.uniforms.u_opacity, {
			value: progress === 1 || progress === 2 ? 1.0 : 0.0,
			duration: 3,
			ease: "power2.out"
		});

		gsap.to(this.wireframeMaterial.uniforms.u_opacity, {
			value: progress === 1 || progress === 2 ? 1.0 : 0.0,
			duration: 3,
			ease: "power2.out"
		});
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
		const normalMap = loader.load("https://raw.githubusercontent.com/8bittree/normal_heights/d7f1ed36457a9861464c5a937913173ac3e20b4d/samples/gebco_08_rev_elev_1080x540_normal.png");
		const earthTexture = loader.load("./src/lib/files/textures/8k_earth_daymap.jpg");
		earthTexture.colorSpace = THREE.SRGBColorSpace;
		const material = new THREE.MeshStandardMaterial({
			map: earthTexture,
			normalMap: normalMap
		});
		const earthBasis = new THREE.Mesh(geometry, material);
		this.earth.add(earthBasis);

		// Create the moon
        const moonGeometry = new THREE.SphereGeometry(this.size / 4, 32, 32);
        const moonTexture = new THREE.TextureLoader().load("https://www.shutterstock.com/image-photo/textured-surface-moon-earths-satellite-260nw-1701426850.jpg");
		const moonNormalMap = new THREE.TextureLoader().load("https://static.turbosquid.com/Preview/2020/02/10__12_15_26/The_Moon_Normal_Map_Cover_000.jpg3B67A625-1ED4-42EC-89CF-71DBFF106E25Large.jpg");
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

		const lightsMa2t = new THREE.MeshBasicMaterial({ 
			map: loader.load('./src/lib/files/textures/8k_earth_nightmap.jpg'),
			blending: THREE.AdditiveBlending,
			transparent: true,
			opacity: 1
		});
		const nightTexture = loader.load('./src/lib/files/textures/8k_earth_nightmap.jpg');
		nightTexture.colorSpace = THREE.SRGBColorSpace;
		/*
		const lightsMat = new THREE.ShaderMaterial({
			uniforms: {
				textureMap: { value: nightTexture },
				sunDirection: { value: sunPosition }, // Adjust this to the actual sun direction
				cameraPosition: { value: this.renderer.camera.position } // Pass the camera position
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
		const lightsMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(this.size * 1.001, 12), lightsMat);
		this.earth.add(lightsMesh);*/
		//let helper = new VertexNormalsHelper(lightsMesh, 2, 0x00ff00);
		//this.earth.add(helper);

		const cloudTexture = loader.load('./src/lib/files/textures/8k_earth_clouds.jpg');
		cloudTexture.colorSpace = THREE.SRGBColorSpace;
		const cloudMat = new THREE.MeshStandardMaterial({
			map: loader.load('./src/lib/files/textures/8k_earth_clouds.jpg'),
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
		this.earth.rotation.y -= 0.0002;
		this.dottedSurface.rotation.y += 0.001;

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
