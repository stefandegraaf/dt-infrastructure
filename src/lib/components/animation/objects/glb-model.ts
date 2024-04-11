import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';


interface glbLoadOptions {
	useDraco?: boolean;
	animated?: boolean;
	scale?: number;
	verticalOffset?: number;
	material?: THREE.Material;
	onBeforeCompile?: (shader: THREE.WebGLProgramParametersWithUniforms) => void;
}


export class ThreeGLBModel {

	private scene: THREE.Scene;
	private positions: Array<THREE.Vector3>;
	private options: glbLoadOptions;

	public model!: THREE.Object3D;
	public modelInstances: Array<THREE.Object3D> = [];
	private mixers: Array<THREE.AnimationMixer> = [];

	public loaded!: Promise<void>;

	constructor(url: string, positions: Array<THREE.Vector3>, scene: THREE.Scene, options: glbLoadOptions) {
		this.scene = scene;
		this.positions = positions;
		this.options = options;
		this.loadModel(url);
	}

	private loadModel(url: string): void {
		const loader = new GLTFLoader();
		if (this.options.useDraco) this.addDracoLoader(loader);
		this.loaded = new Promise((resolve, reject) => {
			loader.load(url, (glb) => {
				this.model = glb.scene;

				// correct position
				let offset = 0;
				if (this.options.verticalOffset) {
					const boundingBox = new THREE.Box3();
					glb.scene.traverse(function(node) {
						if (node instanceof THREE.Mesh) {
							boundingBox.expandByObject(node);
						}
					});
					const height = boundingBox.max.z - boundingBox.min.z;
					offset = height * this.options.verticalOffset;
					//glb.scene.position.y = offset;
					//const helper = new THREE.Box3Helper(boundingBox, 0xffff00);
					//this.scene.add(helper);
				}

				if (this.options.material) {
					glb.scene.traverse((node) => {
						if (node instanceof THREE.Mesh) {
							node.material = this.options.material;
						}
					});
				}
				if (this.options.onBeforeCompile) {
					glb.scene.traverse((node) => {
						if (node instanceof THREE.Mesh) {
							node.material.onBeforeCompile = this.options.onBeforeCompile;
						}
					});
				}

				glb.scene.traverse((node) => {
					if (node instanceof THREE.Mesh) {
						node.castShadow = true;
						node.receiveShadow = true;
						//if (node.material instanceof THREE.MeshBasicMaterial) {
					//		node.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
					//	}
					}
				});

				for (let i = 0; i < this.positions.length; i++) {
					const instance = this.model.clone();
					instance.position.set(this.positions[i].x, this.positions[i].y, this.positions[i].z);
					instance.position.y += offset
					this.modelInstances.push(instance);

					if (this.options.scale) {
						instance.scale.set(this.options.scale, this.options.scale, this.options.scale);
					}

					if (this.options.animated) {
						const mixer = new THREE.AnimationMixer(instance);
						this.mixers.push(mixer);
						const clips = glb.animations;
						if (clips.length > 0) {
							const action = mixer.clipAction(clips[0]);
							action.play();
						}
					}
				}
				resolve();
			}, 
			undefined, // onProgress
			reject // onError
			);
		});
	}

	private afterModelLoaded(): void {
		//this.model.scale.set(0.1, 0.1, 0.1);
		//this.model.position.set(0, 0, 0);
		//this.model.rotation.set(0, 0, 0);
	}

	private addDracoLoader(gltfLoader: GLTFLoader): void {
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
		gltfLoader.setDRACOLoader(dracoLoader);
	}

	public updateAnimation(delta: number): void {
		if (this.options.animated && this.mixers) {
			this.mixers.forEach(mixer => mixer.update(delta));
		}
	}
}

