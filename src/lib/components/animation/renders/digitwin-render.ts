import * as THREE from 'three';
import gsap from 'gsap';

import type { RenderHandler } from '../render-handler';
import { ThreeRenderAbstract } from './render-base';
import { ThreeGLBModel } from './glb-render';
import { animateCamera } from '../gsap-helpers';


export class DigiTwinRender extends ThreeRenderAbstract {

	private sogelinkOffice!: ThreeGLBModel;
	private trees!: ThreeGLBModel;

	constructor(renderer: RenderHandler, start: number, end: number) {
		super(renderer, start, end);
		this.construct();
		this.renderer.progressWritable.subscribe((progress) => {
			if (
				(progress >= this.start - 0.99 && progress < this.end - 0.01) ||
				(progress >= 11 - 0.99 && progress < 12 - 0.01) ||
				(progress >= 13 - 0.99 && progress < 14 - 0.01)
			) {
				if (!this.added) this.add();
			} else {
				if (this.added) this.dispose();
			}
		});
		this.renderer.selectedIndex.subscribe((step) => {
			this.onStepChange(step);
		});
	}

	detach() {
		this.dispose();
	}

	addToScene() {
		/* DIRTY GLB LOAD FIX */
		if (!this.sogelinkOffice.loaded || !this.trees.loaded){ setTimeout(() => this.addToScene(), 10); return; }
		/* DIRTY GLB LOAD FIX */
		this.sogelinkOffice.modelInstances.forEach(model => {
			this.renderer.pivot.add(model);
		});
		this.trees.modelInstances.forEach(model => {
			this.renderer.pivot.add(model);
		});
	}

	disposeFromScene() {
		this.sogelinkOffice.modelInstances.forEach(model => {
			this.renderer.pivot.remove(model);
		});
		this.trees.modelInstances.forEach(model => {
			this.renderer.pivot.remove(model);
		});
	}

	onStepChange(step: number) {
		if (step === 0) {
		}
		// Second appearance of the DigiTwin
		 else if (step === 10) {
			this.objectsOut();
		} else if (step === 11) {
			this.objectsIn();
		} else if (step === 12) {
			this.objectsOut();
		} else if (step === 13) {
			this.objectsIn();
		} else if (step === 14) {
			this.objectsOut();
		}
	}

	private objectsIn(): void {
		this.trees.modelInstances.forEach(object => {
			object.position.y = 200;
			gsap.to(object.position, {
				duration: Math.random() * 2 + 2,
				y: 0,
				ease: "power1.out",
				overwrite: "auto"
			});
		});
	}

	private objectsOut(): void {
		this.trees.modelInstances.forEach(object => {
			gsap.to(object.position, {
				duration: Math.random() * 4 + 2,
				y: 200,
				ease: "power1.out",
				overwrite: "auto"
			});
		});
	
	}

	construct() {

		let slURL = 'src/lib/files/glb/maquette_models_sm_windturbine.glb';
		//let slURL = 'src/lib/files/glb/01_batiment_v_6.glb';
		this.sogelinkOffice = new ThreeGLBModel(slURL, [new THREE.Vector3(10, 0, 0)], this.renderer.scene, {
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
		
	}
}