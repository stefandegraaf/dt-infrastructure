import * as THREE from 'three';
import gsap from 'gsap';

import type { RenderHandler } from '../render-handler';
import { ThreeRenderAbstract } from './render-base';
import { ThreeGLBModel } from './glb-render';
import { generateRandomPositions } from '../render-helpers';


export class DigiTwinRender extends ThreeRenderAbstract {

	private buildings!: ThreeGLBModel;
	private trees!: ThreeGLBModel;
	private windmills!: ThreeGLBModel;

	constructor(renderer: RenderHandler, start: number, end: number) {
		super(renderer, start, end);
		this.construct();
		this.renderer.progressWritable.subscribe((progress) => {
			if (
				(progress >= this.start - 0.99 && progress < this.end - 0.01) ||
				(progress >= 11 - 0.99 && progress < 12 - 0.01) ||
				(progress >= 13 - 0.99 && progress < 16 - 0.01)
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
		if (!this.buildings.loaded || !this.trees.loaded){ setTimeout(() => this.addToScene(), 10); return; }
		/* DIRTY GLB LOAD FIX */
		this.buildings.modelInstances.forEach(model => {
			//this.renderer.scene.add(model);
			this.renderer.pivot.add(model);
		});
		this.trees.modelInstances.forEach(model => {
			//this.renderer.scene.add(model);
			this.renderer.pivot.add(model);
		});
		this.windmills.modelInstances.forEach(model => {
			//this.renderer.scene.add(model);
			this.renderer.pivot.add(model);
		});
	}

	disposeFromScene() {
		this.buildings.modelInstances.forEach(model => {
			//this.renderer.scene.remove(model);
			this.renderer.pivot.remove(model);
		});
		this.trees.modelInstances.forEach(model => {
			//this.renderer.scene.remove(model);
			this.renderer.pivot.remove(model);
		});
		this.windmills.modelInstances.forEach(model => {
			//this.renderer.scene.remove(model);
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
		} else if (step === 13 || step === 14 || step === 15) {
			this.objectsIn();
		} else if (step === 16) {
			this.objectsOut();
		}
	}

	private objectsIn(): void {
		this.trees.modelInstances.forEach(object => {
			//object.position.y = 200;
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
		
		const buildings = "https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/glb/buildings-tile-1.glb";
		const buildingOnBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
				shader.vertexShader = shader.vertexShader.replace(
					"#include <common>",
					`
					#include <common>
					varying float vY;
					`
				),
				shader.vertexShader = shader.vertexShader.replace(
					"#include <begin_vertex>",
					`
					#include <begin_vertex>
					vY = position.y * -1.;
					`
				),
				shader.fragmentShader = shader.fragmentShader.replace(
					"#include <common>",
					`
					#include <common>
					varying float vY;
					`
				),
				shader.fragmentShader = shader.fragmentShader.replace(
					"#include <color_fragment>",
					`
					#include <color_fragment>
					float y = clamp((vY - 0.0) / (10.0 - 0.0), 0.0, 1.0);
					vec3 col_bottom = vec3(0.2, 0.2, 0.2);
					vec3 col_top = vec3(0.9, 0.9, 1.0);
					diffuseColor.rgb = mix(col_bottom, col_top, y);
					`
				)
			}
		this.buildings = new ThreeGLBModel(buildings, [new THREE.Vector3(0, 0, 0)], this.renderer.scene, {
			useDraco: false,
			animated: false,
			onBeforeCompile: buildingOnBeforeCompile
		});

		const s = 200;
		const treePositions = generateRandomPositions(20, -s, s, -s, s);
		this.trees = new ThreeGLBModel('https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/glb/tree.glb', treePositions, this.renderer.scene, {
			useDraco: true,
			animated: false,
			verticalOffset: undefined
		});

		const windmillPositions = [
			new THREE.Vector3(-s * 0.8, 0, -s  * 0.7),
			new THREE.Vector3(-s * 0.4, 0, -s * 0.8),
			new THREE.Vector3(-s * 0, 0, -s * 0.9),
			new THREE.Vector3(s * 0.4, 0, -s * 1.0),
			new THREE.Vector3(150, 0, 20),
			new THREE.Vector3(0, 0, 20),
		]
		this.windmills = new ThreeGLBModel('https://storage.googleapis.com/ahp-research/maquette/models/sm_windturbine.glb', windmillPositions, this.renderer.scene, {
			useDraco: false,
			animated: true,
			scale: 0.5
		});

	}

	render() {
		const delta = this.renderer.clock.getDelta();
		this.windmills.updateAnimation(delta);
	}
}