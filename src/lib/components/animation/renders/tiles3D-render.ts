import { TilesRenderer, B3DMLoader } from '3d-tiles-renderer';
import * as THREE from 'three';
import type { ThreeRenderComplete } from '../render-complete';
import { ThreeRenderAbstract } from './render-base';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { geodeticToCartesian, lookAtCartesian3 } from '../render-helpers';


export class ThreeDeeTilesRender extends ThreeRenderAbstract {

	private url: string;
	private tilesRenderer: TilesRenderer;
	private animationFrame: number | undefined;

	constructor(renderer: ThreeRenderComplete, url: string = "https://storage.googleapis.com/ahp-research/maquette/bim/tenpost/bim_second/tileset.json") {
		super(renderer);
		this.url = url;
		this.tilesRenderer = new TilesRenderer(url);
		this.init();
	}

	addToScene() {
		this.renderer.scene.add(this.tilesRenderer.group);
	}

	disposeFromScene() {
		this.renderer.scene.remove(this.tilesRenderer.group);
	}

	show(): void {
	}

	hide(): void {
	}

	private addDracoSupport(tilesRenderer: TilesRenderer) {
		const dracoLoader = new DRACOLoader();
		//dracoLoader.setDecoderPath('https://unpkg.com/three@0.123.0/examples/js/libs/draco/gltf/');
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
		const loader = new GLTFLoader(tilesRenderer.manager);
		loader.setDRACOLoader(dracoLoader);
		tilesRenderer.manager.addHandler(/\.gltf$/, loader);
	}

	render(): void {
		new OrbitControls(this.renderer.camera, this.renderer.canvas);

		//const vector = new THREE.Vector3(0, 0, 0);
		const vector = new THREE.Vector3(4333876, -122025, 4662269); // Orvault : Draco error || https://storage.googleapis.com/ahp-research/projects/sogelink/hackathon/ifc/existing_building/tileset.json
		//const vector = new THREE.Vector3(4326138, -178387, 4683382); // Orvault : Draco error || https://storage.googleapis.com/ahp-research/projects/sogelink/hackathon/ifc/existing_building/tileset.json
		//const vector = new THREE.Vector3(3793553, 447896, 5090624); // Ten Post || https://storage.googleapis.com/ahp-research/maquette/bim/tenpost/bim_second/tileset.json
		const normal = vector.clone().normalize();
		const dist = 1000;
		
		const randomVec = new THREE.Vector3(1, 1, 1);
		randomVec.cross(normal).normalize();

		const newVector = new THREE.Vector3(normal.x * dist, normal.y * dist, normal.z * dist);
		newVector.applyAxisAngle(randomVec, Math.PI / 4); //.add(vector);
		//newVector.multiplyScalar(dist);
		//camera.position.copy(newVector).add(vector);

		
		

		this.tilesRenderer = new TilesRenderer(this.url);
		this.tilesRenderer.setCamera(this.renderer.camera);
		this.tilesRenderer.setResolutionFromRenderer(this.renderer.camera, this.renderer.renderer);
		this.renderer.scene.add(this.tilesRenderer.group);		

		this.addDracoSupport(this.tilesRenderer);

		this.renderer.camera.position.z += 1150;
		const light = new THREE.PointLight(0xffffff, 1, 1000);
		light.position.set(0, 0, 20);
		light.position.z += 50;
		this.renderer.scene.add(light);



		// Create a square geometry
		const geometry = new THREE.PlaneGeometry(10, 10);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
		const square = new THREE.Mesh(geometry, material);
		square.position.set(0, 0, 0);
		this.renderer.scene.add(square);

		
		
		//let newLength = pivotPoint.length();
		//pivotPoint.normalize().multiplyScalar(newLength);
		const totalVec = vector.clone().add(newVector);
		this.renderer.camera.position.set(totalVec.x, totalVec.y, totalVec.z );
		this.renderer.camera.lookAt(vector);

		/*
		let pivotPoint = vector.clone();
		const pivot = new THREE.Object3D();
		pivot.position.set(pivotPoint.x, pivotPoint.y, pivotPoint.z);
		this.renderer.scene.add(pivot);
		pivot.add(this.renderer.camera);
		const rotationAxis = new THREE.Vector3(3879988, 336566, 5034108).normalize();
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(normal, 0.008); // 0.01 is the rotation angle in radians
		*/

		this.tilesRenderer.onLoadTileSet = (tileSet) => {
			console.log('Tileset loaded', tileSet);
			const boundingVolume = tileSet.root.boundingVolume.region;
			const cartesianSWLowerCorner = geodeticToCartesian(boundingVolume[0], boundingVolume[1], boundingVolume[4]);
			//this.renderer.camera.position.set(cartesianSWLowerCorner.x, cartesianSWLowerCorner.z, cartesianSWLowerCorner.y);
			console.log('Position', geodeticToCartesian(boundingVolume[0], boundingVolume[1], boundingVolume[4]))
		};
		this.tilesRenderer.onLoadModel = (scene, tile) => {
			console.log('Model loaded', scene, tile);

			this.renderer.camera.position.copy(scene.position);
			this.renderer.camera.position.z += 100;
			this.renderer.camera.lookAt(scene.position);
			const model = scene.children[0]; // Get the loaded model
			console.log('Model', model);
			model.children.forEach((child) => {
				if (child instanceof THREE.Mesh) {
					this.renderer.scene.add(child);
					child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Set to red
					lookAtCartesian3(this.renderer.camera, new THREE.Vector3(0,0,0), 50, 45);
					console.log('Child', child	)
				}
			});
			
		};
	}

	renderLoop() {
		//pivot.quaternion.multiply(quaternion);
		//camera.applyQuaternion(quaternion);
		//const newPosition = vector.clone().applyQuaternion(quaternion);
		//camera.lookAt(newPosition);
		this.renderer.camera.updateMatrixWorld();

		this.tilesRenderer.update();
	}


}
