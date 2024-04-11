import * as THREE from 'three';
import gsap from 'gsap';

import type { RenderHandler } from '../render-handler';
import { ThreeRenderAbstract } from './render-base';
import { ThreeGLBModel } from '../objects/glb-model';
import { FlightPathCenter } from '../objects/flight-path';
import { animateToFlightPath } from '../gsap-helpers';


export class BIMRender extends ThreeRenderAbstract {

	private sogelinkOffice!: ThreeGLBModel;
	private flightPath: FlightPathCenter = new FlightPathCenter(
		[
			new THREE.Vector3(-35, 18, -20),
			new THREE.Vector3(-2, 2, 5),
			new THREE.Vector3(22, 20, 28),
			new THREE.Vector3(-25, 6, 30),
			new THREE.Vector3(-35, 18, -20)
		], 
		0.00004
	);

	constructor(renderer: RenderHandler, start: number, end: number) {
		super(renderer, start, end);
		this.construct();
	}

	private addSubribers(): void {
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
		this.sogelinkOffice.modelInstances.forEach(model => this.renderer.scene.add(model));
	}

	disposeFromScene() {
		this.sogelinkOffice.modelInstances.forEach(model => this.renderer.pivot.remove(model));
	}

	onStepChange(step: number) {
		if (step === 15) {
			this.flightPath.active = false;
		}
		else if (step === 16) {
			animateToFlightPath({
				camera: this.renderer.camera,
				flightPath: this.flightPath, 
				duration: 1.5
			});
		} else if (step === 17) {
			this.flightPath.active = false;
		}
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
		
		this.sogelinkOffice.loaded.then(() => {
			this.addSubribers();
		});
	}

	render() {
		this.flightPath.updateCamera(this.renderer.camera);
	}
}