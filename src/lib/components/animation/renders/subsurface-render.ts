import * as THREE from 'three';
import gsap from 'gsap';
import { ThreeRenderAbstract } from './render-base';
import type { RenderHandler } from '../render-handler';
import { color } from 'three/examples/jsm/nodes/shadernode/ShaderNode';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RaycasterBase } from '../objects/raycaster';


export class SubsurfaceRender extends ThreeRenderAbstract {

	private voxels!: THREE.InstancedMesh;
	private voxelTransition = { value: 0 };
	private raycaster: RaycasterBase = new RaycasterBase(this.renderer.canvas);

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

	addToScene() {
		// --> through onStepChange()
	}

	disposeFromScene() {
		// --> through onStepChange()
	}

	onStepChange(progress: number) {
		if (progress === 15) {
			gsap.killTweensOf(this.voxelTransition);
			this.renderer.scene.add(this.voxels);
			gsap.to(this.voxelTransition, { value: 1, duration: 6 });
		}
		else {
			gsap.to(this.voxelTransition, { 
				value: 0, 
				duration: 3.5,
				onComplete: () => {
					this.renderer.scene.remove(this.voxels);
				}
			});
		}
	}


	construct() {
		const voxelSize = 20;
		const gridWidth = 25;
		const gridHeight = 15;
		const gridDepth = 25;

		const voxelGeometry = new RoundedBoxGeometry(voxelSize, voxelSize/2, voxelSize, 2, voxelSize * 0.05);

		const voxelShaderMaterial = new THREE.MeshPhysicalMaterial({
			roughness: 0.65,
			transparent: true,
			depthTest: true
		});
		voxelShaderMaterial.onBeforeCompile = (shader) => {
			shader.uniforms = Object.assign(shader.uniforms, {
				u_voxelTransition: this.voxelTransition
			});
			shader.vertexShader = shader.vertexShader.replace(
				"#include <common>",
				`
				#include <common>

				attribute float acceleration;
				attribute float dispersion;
				attribute float distanceFromOrigin;
				attribute vec3 instanceColor;
				varying vec3 vColor;
				uniform float u_voxelTransition;
				`
			);
			shader.vertexShader = shader.vertexShader.replace(
				"#include <begin_vertex>",
				`
				#include <begin_vertex>

				vColor = instanceColor;
				float progress = clamp(u_voxelTransition * acceleration, 0.0, 1.0);
				progress = 1.0 - pow(1.0 - progress, 3.0);
				float dist = 50.0 * dispersion;
				vec3 pos = position + ((1.0 - progress) * vec3((0.2 - progress/5.0) * instanceMatrix[3][0] * dist, instanceMatrix[3][1] * 5.0 * (1.0 - distanceFromOrigin) - 50., (0.5 - progress/2.0) * instanceMatrix[3][2]) * dist);
				transformed = pos;
				
				`
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <common>",
				`
				#include <common>
				varying vec3 vColor;
				uniform float u_voxelTransition;
				`
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <color_fragment>",
				`
				#include <color_fragment>

				float opacity = smoothstep(0.0, 0.6, u_voxelTransition);
				diffuseColor = vec4(vColor, opacity);
				`		
			);
		}


		const voxelCount = gridWidth * gridHeight * gridDepth;
		this.voxels = new THREE.InstancedMesh(voxelGeometry, voxelShaderMaterial, voxelCount);
		this.voxels.receiveShadow = true;
		
		const colors = new Float32Array(voxelCount * 3);
		const acceleration = new Float32Array(voxelCount);
		const dispersion = new Float32Array(voxelCount);
		const distanceFromOrigin = new Float32Array(voxelCount);

		let instanceIndex = 0;
		const matrix = new THREE.Matrix4();
		for (let x = 0; x < gridWidth; x++) {
			for (let y = 0; y < gridHeight; y++) {
				for (let z = 0; z < gridDepth; z++) {
					const posX = (x - gridWidth/2) * voxelSize;
					const posY = -y * voxelSize/2 - voxelSize/2;
					const posZ = (z - gridDepth/2) * voxelSize;
					matrix.setPosition(posX, posY, posZ);
					this.voxels.setMatrixAt(instanceIndex, matrix);

					const color = this.voxelColor(x/gridWidth, y/gridHeight, z/gridDepth);
					colors[instanceIndex * 3] = color.r;
					colors[instanceIndex * 3 + 1] = color.g;
					colors[instanceIndex * 3 + 2] = color.b;
					acceleration[instanceIndex] = 1 + Math.random() * 2 * (1 - y / gridHeight) * (1 - Math.abs(0.5 - x / gridWidth)) * (1 - Math.abs(0.5 - z / gridDepth));
					dispersion[instanceIndex] = 0.3 + Math.random();

					const distanceFromCenter = Math.sqrt(Math.pow(posX, 2) + Math.pow(posZ, 2));
					const maxDistanceFromCenter = Math.sqrt(Math.pow(gridWidth/2 * voxelSize, 2) + Math.pow(gridDepth/2 * voxelSize, 2));
					distanceFromOrigin[instanceIndex] = distanceFromCenter / maxDistanceFromCenter;
					instanceIndex++;
				}
			}
		}
	
		this.voxels.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
		this.voxels.geometry.setAttribute('acceleration', new THREE.InstancedBufferAttribute(acceleration, 1));
		this.voxels.geometry.setAttribute('dispersion', new THREE.InstancedBufferAttribute(dispersion, 1));
		this.voxels.geometry.setAttribute('distanceFromOrigin', new THREE.InstancedBufferAttribute(distanceFromOrigin, 1));

		this.voxels.instanceMatrix.needsUpdate = true;


	}

	private voxelColor(x: number, y: number, z: number): {r: number, g: number, b: number} {
		// Define the center of each lithology layer
		const centers = {
			clay: 0.5,
			clayeySand: 0.7,
			sand: 0.3,
			gravel: 0.9,
			peat: 0.1
		};
	
		// Define the inclination
		const inclination = 0.1;
	
		// Adjust y based on the inclination and x and z coordinates
		let yAdjusted = y + inclination * (x + z);
	
		// Calculate the chance for each lithology
		// Calculate the chance for each lithology
		const chanceClay = Math.max(0, 1 - Math.abs(yAdjusted - centers.clay) / 0.4);
		const chanceClayeySand = Math.max(0, 1 - Math.abs(yAdjusted - centers.clayeySand) / 0.4);
		const chanceSand = Math.max(0, 1 - Math.abs(yAdjusted - centers.sand) / 0.4);
		const chanceGravel = Math.max(0, 1 - Math.abs(yAdjusted - centers.gravel) / 0.4);
		const chancePeat = Math.max(0, 1 - Math.abs(yAdjusted - centers.peat) / 0.4);
	
		// Normalize the chances
		const total = chanceClay + chanceClayeySand + chanceSand + chanceGravel + chancePeat;
	
		// Generate a random number
		const rand = Math.random() * total;
	
		// Determine the lithology based on the random number
		let lithoColor;
		if (rand < chanceClay) {
			lithoColor = lithoColors.clay;
		} else if (rand < chanceClay + chanceClayeySand) {
			lithoColor = lithoColors.clayeySand;
		} else if (rand < chanceClay + chanceClayeySand + chanceSand) {
			lithoColor = lithoColors.sand;
		} else if (rand < chanceClay + chanceClayeySand + chanceSand + chanceGravel) {
			lithoColor = lithoColors.gravel;
		} else {
			lithoColor = lithoColors.peat;
		}
	
		// Return the color of the chosen lithology
		return {r: lithoColor.r, g: lithoColor.g, b: lithoColor.b};
	}



	render() {
		//console.log(this.raycaster.checkIntersection(this.voxels, this.renderer.camera));
		//this.progress.value = Math.max(0, 1 - Math.abs(this.renderer.progress.value - this.start));
	}
}

const lithoColors = {
	peat: new THREE.Color(0.6, 0.3, 0.25),
	clay: new THREE.Color(0, 0.57, 0),
	clayeySand: new THREE.Color(0.76, 0.81, 0.36),
	sand: new THREE.Color(0.95, 0.88, 0.02),
	gravel: new THREE.Color(0.85, 0.62, 0.04)
}