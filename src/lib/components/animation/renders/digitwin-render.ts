import * as THREE from 'three';
import gsap from 'gsap';

import type { ThreeRenderComplete } from '../render-complete';
import { ThreeRenderAbstract } from './render-base';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThreeGLBModel } from './glb-render';


export class DigiTwinRender extends ThreeRenderAbstract {

	private terrain!: THREE.Mesh;
	private sogelinkOffice!: ThreeGLBModel;
	private trees!: ThreeGLBModel;

	private lights!: THREE.Light[];

	constructor(renderer: ThreeRenderComplete, start: number, end: number) {
		super(renderer, start, end);
		this.construct();
		this.renderer.progressWritable.subscribe((progress) => {
			if (progress >= start - 0.99 && progress < end - 0.01) {
				if (!this.added) this.add();
			} else {
				if (this.added) this.dispose();
			}
		});
		this.renderer.stepWritable.subscribe((step) => {
			this.onStepChange(step - this.start);
		});
	}

	addToScene() {
		/* DIRTY GLB LOAD FIX */
		if (!this.sogelinkOffice.loaded || !this.trees.loaded){ setTimeout(() => this.addToScene(), 10); return; }
		/* DIRTY GLB LOAD FIX */
		this.renderer.scene.add(this.terrain);
		this.sogelinkOffice.modelInstances.forEach(model => this.renderer.scene.add(model));
		this.trees.modelInstances.forEach(model => this.renderer.scene.add(model));
		this.lights.forEach(light => this.renderer.scene.add(light));
	}

	disposeFromScene() {
		this.renderer.scene.remove(this.terrain);
		this.sogelinkOffice.modelInstances.forEach(model => this.renderer.scene.remove(model));
		this.trees.modelInstances.forEach(model => this.renderer.scene.remove(model));
		this.lights.forEach(light => this.renderer.scene.remove(light));
	}

	onStepChange(progress: number) {
		if (progress === 0) {
			gsap.to(this.renderer.camera.position, {
				x: 0,
				y: 50,
				z: 80,
				duration: 3,
				ease: "power2.out",
				onUpdate: () => {
					this.renderer.camera.lookAt(0, 0, 0);
				}
			});
		} else if (progress === 11) {
			// Second appearance of the DigiTwin
		}
	}

	construct() {
		new OrbitControls(this.renderer.camera, this.renderer.canvas);

		const geometry = new THREE.PlaneGeometry(250, 250, 100, 100);
		geometry.rotateX(-Math.PI / 2);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('src/lib/files/textures/mountain-texture.jpg');
		const displacementMap = loader.load('https://blenderartists.org/uploads/default/original/4X/5/0/5/505f9cafccb6e5c00bba9da7be24478b69186cb4.jpeg');
		const alphaMap = loader.load('src/lib/files/textures/alpha-map-round.jpg');

		const displacementScale = { value: 0.1 };

		const wireframeMaterial = new THREE.MeshStandardMaterial({
			color: 0x00e1ff,
			side: THREE.DoubleSide,
			displacementMap: displacementMap,
			displacementScale: displacementScale.value,
			alphaMap: alphaMap,
			transparent: true,
			wireframe: true,
			depthTest: true
		});
		this.terrain = new THREE.Mesh(geometry, wireframeMaterial);

		var axesHelper = new THREE.AxesHelper(25);
		this.renderer.scene.add(axesHelper);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(0, 1, 0); // set the direction of the light
		this.lights = [ambientLight, directionalLight];

		//this.pivot.position.set(0, 0, 0);

		this.sogelinkOffice = new ThreeGLBModel('src/lib/files/glb/maquette_models_sm_windturbine.glb', [new THREE.Vector3(-30, 0, -20)], this.renderer.scene, {
			useDraco: true,
			animated: false,
			verticalOffset: 0.5
		});
		
		const treePositions = [
			new THREE.Vector3(40, 0, 0),
			new THREE.Vector3(35, 0, 40),
			new THREE.Vector3(-30, 0, -40),
			new THREE.Vector3(-40, 0, 30),
			new THREE.Vector3(35, 0, -30),
		]
		this.trees = new ThreeGLBModel('src/lib/files/glb/tree.glb', treePositions, this.renderer.scene, {
			useDraco: true,
			animated: false,
			verticalOffset: undefined
		});
	}

	render() {
		this.renderer.pivot.rotation.y += 0.001;
	}
}