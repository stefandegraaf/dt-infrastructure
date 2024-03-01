import * as THREE from 'three';
import gsap from 'gsap';

import type { ThreeRenderComplete } from '../render-handler';
import { ThreeRenderAbstract } from './render-base';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


export class TerrainRender extends ThreeRenderAbstract {

	private textureMesh!: THREE.Mesh;
	private textureMaterial!: THREE.MeshStandardMaterial;
	private wireframeMesh!: THREE.Mesh;
	private wireframeMaterial!: THREE.MeshStandardMaterial;


	constructor(renderer: ThreeRenderComplete) {
		super(renderer);
		this.init();
	}

	addToScene() {
		this.renderer.scene.add(this.textureMesh);
		this.renderer.scene.add(this.wireframeMesh);
		this.renderer.camera.position.set(0, 2, 5);
	}

	disposeFromScene() {
		this.renderer.scene.remove(this.textureMesh);
		this.renderer.scene.remove(this.wireframeMesh);
	}

	show() {
		this.textureMesh.visible = true;
		this.wireframeMesh.visible = true;
	}

	hide() {
		this.textureMesh.visible = false;
		this.wireframeMesh.visible = false;
	}

	render() {
		new OrbitControls(this.renderer.camera, this.renderer.canvas);

		const geometry = new THREE.PlaneGeometry(10, 10, 64, 64);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('src/lib/files/textures/mountain-texture.jpg');
		const displacementMap = loader.load('https://blenderartists.org/uploads/default/original/4X/5/0/5/505f9cafccb6e5c00bba9da7be24478b69186cb4.jpeg');
		const alphaMap = loader.load('src/lib/files/textures/alpha-map-round.jpg');

		const displacementScale = { value: 0.1 };
		this.textureMaterial = new THREE.MeshStandardMaterial({ 
			color: 0x00e1ff,
			side: THREE.DoubleSide,
			map: texture,
			displacementMap: displacementMap,
			displacementScale: displacementScale.value,
			alphaMap: alphaMap,
			transparent: true,
			opacity: 0.5,
			depthTest: false
		});
		this.textureMesh = new THREE.Mesh(geometry, this.textureMaterial);

		this.wireframeMaterial = new THREE.MeshStandardMaterial({
			color: 0x00e1ff,
			side: THREE.DoubleSide,
			displacementMap: displacementMap,
			displacementScale: displacementScale.value,
			alphaMap: alphaMap,
			transparent: true,
			wireframe: true,
			depthTest: false
		});
		this.wireframeMesh = new THREE.Mesh(geometry, this.wireframeMaterial);

		const positions = geometry.attributes.position.array;


		const pointLight = new THREE.PointLight(0xffffff, 10);
		pointLight.position.set(0, 0, 5);
		this.renderer.scene.add(pointLight);
		
		
	}

	renderLoop() {
		const progress = Math.abs(Math.sin(performance.now() / 5000));
		this.textureMaterial.displacementScale = progress * 2;
		this.wireframeMaterial.displacementScale = progress * 2;
		this.textureMaterial.opacity = progress;
		this.wireframeMaterial.opacity = 1 - progress * progress;
	}
}