import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader';

import type { RenderHandler } from '../render-handler';
import { createNoise2D } from 'simplex-noise';
import { ThreeRenderAbstract } from './render-base';


interface glbLoadOptions {
	useDraco?: boolean;
	animated?: boolean;
	verticalOffset?: number;
}

export class ThreeGLBModel {

	private scene: THREE.Scene;
	private positions: Array<THREE.Vector3>;
	private options: any;

	public model!: THREE.Object3D;
	public modelInstances: Array<THREE.Object3D> = [];
	private mixers!: Array<THREE.AnimationMixer>;

	public loaded: boolean = false;

	constructor(url: string, positions: Array<THREE.Vector3>, scene: THREE.Scene, options: glbLoadOptions) {
		this.scene = scene;
		this.positions = positions;
		this.options = options;
		this.loadModel(url);
	}

	private loadModel(url: string): void {
		const loader = new GLTFLoader();
		if (this.options.useDraco) this.addDracoLoader(loader);
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
				const offset = height * this.options.verticalOffset;
			
				glb.scene.position.y = offset;
				//const helper = new THREE.Box3Helper(boundingBox, 0xffff00);
				//this.scene.add(helper);
			}

			for (let i = 0; i < this.positions.length; i++) {
				const instance = this.model.clone();
				instance.position.set(this.positions[i].x, this.positions[i].y, this.positions[i].z);
				instance.position.y += offset
				this.modelInstances.push(instance);

				if (this.options.animated) {
					const mixer = new THREE.AnimationMixer(this.model);
					this.mixers.push(mixer);
					const clips = glb.animations;
					if (clips.length > 0) {
						const action = mixer.clipAction(clips[0]);
						action.play();
					}
				}
			}
			this.loaded = true;
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
		if (this.options.animated && this.mixers) this.mixers.forEach(mixer => mixer.update(delta));
	}
}




class ThreeTerrainModel {

	private relief: number;
	private geometry: THREE.PlaneGeometry;
    public wireframe: THREE.LineSegments;

    constructor(relief: number = 0, width: number, height: number, widthSegments: number, heightSegments: number) {
		this.relief = relief;
		this.geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
		if (this.relief > 0) this.addRelief(this.geometry);
        const wireframeGeometry = new THREE.WireframeGeometry(this.geometry);
        this.wireframe = new THREE.LineSegments(wireframeGeometry, new THREE.LineBasicMaterial());
		this.wireframe.frustumCulled = false; // Set frustumCulled to false to prevent the wireframe from affecting the viewer size
		this.wireframe.rotation.x = -Math.PI / 2; 
	}

	private addRelief(plane: THREE.PlaneGeometry): void {
		const positions = plane.attributes.position.array;
		const noise2D = createNoise2D();
        for (let i = 2; i < positions.length; i += 3) {
            const x = positions[i - 2];
            const y = positions[i - 1];
            positions[i] += noise2D(x / 100, y / 200) * this.relief; // Change 10 to the desired height range
        }
	}

}

class FlightPath {

	private curve: THREE.CatmullRomCurve3;
	private time: number;
	private speed: number;

	constructor(points: Array<THREE.Vector3>, speed: number) {
		this.curve = new THREE.CatmullRomCurve3(points);
		this.time = 0;
		this.speed = speed ?? 0.0001;
	}

	public getPoint(): THREE.Vector3 {
		this.time += 0.0001;
		return this.curve.getPoint(this.time % 1);
	}

	public updateCamera(camera: THREE.PerspectiveCamera): void {
		this.time += this.speed;
		const position = this.getPoint();
		camera.position.copy(position);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
	}
}



export class GLBRender extends ThreeRenderAbstract {

	private url: string;
	private models: Array<ThreeGLBModel> = [];

	private terrain!: ThreeTerrainModel;
	private flightPath!: FlightPath;
	private animated: boolean;
	private clock: THREE.Clock | undefined;

	constructor(renderer: RenderHandler, start: number, end: number, url: string, animated: boolean) {
		super(renderer, start, end);
		this.url = url;
		this.animated = animated;
		if (this.animated) this.clock = new THREE.Clock();
	}

	addToScene() {
		this.models.forEach(model => {
			console.log(model.model)
			if (model.model instanceof THREE.Object3D) this.renderer.scene.add(model.model)
		});
		this.renderer.scene.add(this.terrain.wireframe);
	}

	disposeFromScene() {
		this.models.forEach(model => this.renderer.scene.remove(model.model));
		this.renderer.scene.remove(this.terrain.wireframe);
	}

	show() {
		this.models.forEach(model => model.model.visible = true);
		this.terrain.wireframe.visible = true;
	}

	hide() {
		this.models.forEach(model => model.model.visible = false);
		this.terrain.wireframe.visible = false;
	}

	construct() {
		this.addModel(this.url, new THREE.Vector3(0,0,0));
		this.addModel(this.url, new THREE.Vector3(100,0,100));
		this.addModel(this.url, new THREE.Vector3(-100,0,-100));

		//this.terrain = new ThreeTerrainModel(2, 300, 300, 100, 100);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
		directionalLight.position.set(5, 5, 5); // Adjust the position of the light
		this.renderer.scene.add(directionalLight);


		this.flightPath = new FlightPath(
			[
				new THREE.Vector3(200, 50, 200),
				new THREE.Vector3(200, 50, -200),
				new THREE.Vector3(200, 50, 200)
			], 
			0.0001
		);
	}

	public addModel(url: string, position: THREE.Vector3): void {
		const model = new ThreeGLBModel(url, [position], this.renderer.scene, {
			useDraco: false,
			animated: this.animated,
			verticalOffset: 0
		});
		this.models.push(model);
	}

	render() {
		this.flightPath.updateCamera(this.renderer.camera);

		if (this.animated && this.clock) {
			const delta = this.clock.getDelta();
			this.models.forEach(model => model.updateAnimation(delta));
		}
	}
}



export class BatchedGLBRender extends ThreeRenderAbstract {

	private urls: Array<string>;
	private models: Array<ThreeGLBModel> = [];

	private terrain!: ThreeTerrainModel;
	private flightPath!: FlightPath;
	private animated: boolean;
	private clock: THREE.Clock | undefined;

	constructor(renderer: RenderHandler, start: number, end: number, urls: Array<string>, animated: boolean) {
		super(renderer, start, end);
		this.urls = urls;
		this.animated = animated;
		if (this.animated) this.clock = new THREE.Clock();
	}

	addToScene() {
		this.models.forEach(model => {
			console.log(model.model)
			if (model.model instanceof THREE.Object3D) this.renderer.scene.add(model.model)
		});
		//this.renderer.scene.add(this.terrain.wireframe);
	}

	disposeFromScene() {
		this.models.forEach(model => this.renderer.scene.remove(model.model));
		//this.renderer.scene.remove(this.terrain.wireframe);
	}

	show() {
		this.models.forEach(model => model.model.visible = true);
		//this.terrain.wireframe.visible = true;
	}

	hide() {
		this.models.forEach(model => model.model.visible = false);
		//this.terrain.wireframe.visible = false;
	}

	construct() {
		this.urls.forEach(url => this.addModel(url));

		//this.terrain = new ThreeTerrainModel(2, 300, 300, 100, 100);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
		directionalLight.position.set(5, 5, 5); // Adjust the position of the light
		this.renderer.scene.add(directionalLight);

		this.renderer.camera.position.set(1400, 350, 100);
		this.renderer.camera.lookAt(0, 0, 0);
	}


	render() {

		this.models.forEach(model => {
			if (model.model?.position) console.log(model)
		
		});
	}

	public lookAtModel(index: number): void {
		if (this.models[index].model?.position) this.renderer.camera.lookAt(this.models[index].model.position);
	}

	public addModel(url: string): void {
		const model = new ThreeGLBModel(url, [new THREE.Vector3(0,0,0)], this.renderer.scene, {
			useDraco: false,
			animated: this.animated,
			verticalOffset: 0
		});
		this.models.push(model);
	}

}
