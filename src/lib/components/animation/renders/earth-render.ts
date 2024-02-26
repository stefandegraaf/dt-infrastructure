import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import type { ThreeRenderComplete } from "../render-complete";
import { getFresnelMaterial } from '../materials/fresnel-material.js';
import { ThreeRenderAbstract } from './render-base';



export class EarthRender extends ThreeRenderAbstract {

	private earth!: THREE.Group;
	private clouds!: THREE.Mesh;
	private moon!: THREE.Mesh;
	private light!: THREE.DirectionalLight;
	private dottedSurface!: THREE.Points;

	private texture: string;
	private size: number;

	private fading = false;
	private opacity = 1.0;


	constructor(renderer: ThreeRenderComplete, texture: string, size: number) {
		super(renderer);
		this.texture = texture;
		this.size = size;
		this.init();
	}

	addToScene(): void {
		this.renderer.scene.add(this.light);
		this.renderer.scene.add(this.earth);
		this.renderer.scene.add(this.moon);
		this.renderer.scene.add(this.dottedSurface);		
	}

	disposeFromScene(): void {
		this.fadeEarth();
		this.renderer.scene.remove(this.light);
		this.renderer.scene.remove(this.earth);
		this.renderer.scene.remove(this.moon);
		this.renderer.scene.remove(this.dottedSurface);
	}

	show(): void {
		this.earth.visible = true;
		this.dottedSurface.visible = true;
	}

	hide(): void {
		this.earth.visible = false;
		this.dottedSurface.visible = false;
	}

	public setRealistic(): void {
		this.setOpacity(1.0);
		this.fading = false;
		this.earth.visible = true;
		this.dottedSurface.visible = false;
	}

	public setDotted(): void {
		this.dottedSurface.visible = true;
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

	render(): void {
		this.earth = new THREE.Group();
		this.earth.position.set(0, 0, 0);
		new OrbitControls(this.renderer.camera, this.renderer.canvas);

		const segments = this.size * 5;
		const geometry = new THREE.IcosahedronGeometry(this.size, 12);
		const loader = new THREE.TextureLoader();
		const normalMap = loader.load("https://raw.githubusercontent.com/8bittree/normal_heights/d7f1ed36457a9861464c5a937913173ac3e20b4d/samples/gebco_08_rev_elev_1080x540_normal.png");
		const earthTexture = loader.load(this.texture);
		earthTexture.colorSpace = THREE.SRGBColorSpace;
		const material = new THREE.MeshStandardMaterial({
			map: earthTexture,
			normalMap: normalMap
		});
		const earthBasis = new THREE.Mesh(geometry, material);
		this.earth.add(earthBasis);

		// Create the moon
        const moonGeometry = new THREE.SphereGeometry(this.size / 4, segments, segments);
        const moonTexture = new THREE.TextureLoader().load("https://www.shutterstock.com/image-photo/textured-surface-moon-earths-satellite-260nw-1701426850.jpg");
		const moonNormalMap = new THREE.TextureLoader().load("https://static.turbosquid.com/Preview/2020/02/10__12_15_26/The_Moon_Normal_Map_Cover_000.jpg3B67A625-1ED4-42EC-89CF-71DBFF106E25Large.jpg");
        const moonMaterial = new THREE.MeshStandardMaterial({
			map: moonTexture,
			normalMap: moonNormalMap
		});
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
        this.moon.position.set(12, 0, 0);


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
		const lightsMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(this.size + 0.01, 12), lightsMat);
		this.earth.add(lightsMesh);
		//let helper = new VertexNormalsHelper(lightsMesh, 2, 0x00ff00);
		//this.earth.add(helper);

		const cloudTexture = loader.load('./src/lib/files/textures/8k_earth_clouds.jpg');
		cloudTexture.colorSpace = THREE.SRGBColorSpace;
		const cloudMat = new THREE.MeshStandardMaterial({
			map: loader.load('./src/lib/files/textures/8k_earth_clouds.jpg'),
			blending: THREE.AdditiveBlending
		});
		this.clouds = new THREE.Mesh(new THREE.IcosahedronGeometry(this.size + 0.04, 12), cloudMat);
		this.earth.add(this.clouds);

		const fresnelMat = getFresnelMaterial({rimHex: 0x00aaff, facingHex: 0x0088ff});
		const fresnelMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(this.size + 0.09, 12), fresnelMat);
		this.earth.add(fresnelMesh);

		this.renderer.camera.position.z = 20;

		this.createDottedSurface();
		//this.addStars();
	}


	private createDottedSurface(): void {
		const geometry = new THREE.BufferGeometry();
		const numberOfDots = 1600;
		const positions = new Float32Array(numberOfDots * 3);

		for (let i = 0; i < numberOfDots; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(1 - 2 * Math.random());
			positions[i * 3] = this.size * Math.sin(phi) * Math.cos(theta);
			positions[i * 3 + 1] = this.size * Math.sin(phi) * Math.sin(theta);
			positions[i * 3 + 2] = this.size * Math.cos(phi);
		}
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		const material = new THREE.PointsMaterial({ size: 0.06, color: 0xff44ff });

		geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(numberOfDots), 1));
		const vertexShader = `
			uniform float time;
			uniform vec3 color;
			attribute float size;
			varying vec3 vColor;
			void main() {
				vColor = color;
				vec3 pos = position;
				vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
				gl_PointSize = size * (300.0 / -mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
			}
		`;

		const fragmentShader = `
			uniform vec3 color;
			varying vec3 vColor;
			void main() {
				gl_FragColor = vec4(color * vColor, 1.0);
			}
		`;
		const material7 = new THREE.ShaderMaterial({
			uniforms: {
				color: { value: new THREE.Color(0xff44ff) },
				time: { value: 0 }
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
		});

		this.dottedSurface = new THREE.Points(geometry, material);
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

	renderLoop() {
		
		this.earth.rotation.y += 0.0008;
		this.dottedSurface.rotation.y += 0.0008;

		this.clouds.rotation.x -= 0.0001;
		this.clouds.rotation.y -= 0.0001;


		// Rotate the moon around the Earth at a fixed incline
		const angle = -Date.now() / 2000;
		const radius = 14;
		const incline = Math.PI / 36; // 5 degrees
		this.moon.position.x = radius * Math.cos(angle);
		this.moon.position.y = radius * Math.sin(incline) * Math.sin(angle);
		this.moon.position.z = radius * Math.cos(incline) * Math.sin(angle);

		if (this.fading) {
			this.setOpacity(this.opacity - 0.004);
		}
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
