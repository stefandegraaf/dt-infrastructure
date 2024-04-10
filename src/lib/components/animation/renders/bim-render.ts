import * as THREE from 'three';
import gsap from 'gsap';

import type { RenderHandler } from '../render-handler';
import { ThreeRenderAbstract } from './render-base';
import { ThreeGLBModel } from './glb-render';
import { FlightPathCenter } from '../objects/flight-path';
import { get } from 'svelte/store';


export class BIMRender extends ThreeRenderAbstract {

	private sogelinkOffice!: ThreeGLBModel;
	private flightPath: FlightPathCenter = new FlightPathCenter(
		[
			new THREE.Vector3(-40, 20, 50),
			new THREE.Vector3(5, 8, 5),
			new THREE.Vector3(40, 30, -100),
			new THREE.Vector3(5, 8, 5)
		], 
		0.00004
	);;

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

	detach() {
		this.dispose();
	}

	addToScene() {
		/* DIRTY GLB LOAD FIX */
		if (!this.sogelinkOffice.loaded){ setTimeout(() => this.addToScene(), 10); return; }
		/* DIRTY GLB LOAD FIX */
		this.sogelinkOffice.modelInstances.forEach(model => {
			//this.renderer.scene.add(model);
			this.renderer.pivot.add(model);
		});
	}

	disposeFromScene() {
		this.sogelinkOffice.modelInstances.forEach(model => {
			//this.renderer.scene.remove(model);
			this.renderer.pivot.remove(model);
		});
		
	}

	onStepChange(step: number) {
	
	}


	construct() {

		let sogelink_5mb = 'https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/glb/sogelink-office-simplified-draco.glb';
		let sogelink_1mb = 'https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/glb/sogelink-office-simplified-no-windows-draco.glb';
		//let slURL = 'src/lib/files/glb/01_batiment_v_6.glb';
		this.sogelinkOffice = new ThreeGLBModel(sogelink_5mb, [new THREE.Vector3(0, 0, 0)], this.renderer.scene, {
			useDraco: true,
			animated: false,
			verticalOffset: 0.5
		});
		

	}

	render() {
		const step = get(this.renderer.selectedIndex);
		//if (step === 16) this.flightPath.updateCamera(this.renderer.camera);
	}
}