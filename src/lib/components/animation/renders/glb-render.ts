import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ThreeRenderComplete } from '../render-complete';
import { createNoise2D } from 'simplex-noise';
import { ThreeRenderAbstract } from './render-base';


class ThreeGLBModel {

	private scene: THREE.Scene;
	private position: THREE.Vector3 | undefined;
	private animated: boolean;
	public model!: THREE.Object3D;
	private mixer!: THREE.AnimationMixer;

	constructor(url: string, position: THREE.Vector3 | undefined, animated: boolean, scene: THREE.Scene) {
		this.scene = scene;
		this.position = position;
		this.animated = animated;
		this.loadModel(url);
	}

	private loadModel(url: string): void {
		const loader = new GLTFLoader();
		loader.load(url, (glb) => {
			this.model = glb.scene;
			if (this.position) this.model.position.set(this.position.x, this.position.y, this.position.z);
			this.scene.add(this.model);
			if (this.animated) {
				this.mixer = new THREE.AnimationMixer(this.model);
				const clips = glb.animations;
				if (clips.length > 0) {
					const action = this.mixer.clipAction(clips[0]);
					action.play();
				}
			}
		});
	}

	public updateAnimation(delta: number): void {
		if (this.animated && this.mixer) this.mixer.update(delta);
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

	constructor(renderer: ThreeRenderComplete, url: string, animated: boolean) {
		super(renderer);
		this.url = url;
		this.animated = animated;
		if (this.animated) this.clock = new THREE.Clock();
		this.init();
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

	render() {
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
		const model = new ThreeGLBModel(url, position, this.animated, this.renderer.scene);
		this.models.push(model);
	}

	renderLoop() {
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

	constructor(renderer: ThreeRenderComplete, urls: Array<string>, animated: boolean) {
		super(renderer);
		this.urls = urls;
		this.animated = animated;
		if (this.animated) this.clock = new THREE.Clock();
		this.init();
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

	render() {
		this.urls.forEach(url => this.addModel(url));

		//this.terrain = new ThreeTerrainModel(2, 300, 300, 100, 100);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
		directionalLight.position.set(5, 5, 5); // Adjust the position of the light
		this.renderer.scene.add(directionalLight);

		this.renderer.camera.position.set(1400, 350, 100);
		this.renderer.camera.lookAt(0, 0, 0);
	}


	renderLoop() {

		this.models.forEach(model => {
			if (model.model?.position) console.log(model)
		
		});
	}

	public lookAtModel(index: number): void {
		if (this.models[index].model?.position) this.renderer.camera.lookAt(this.models[index].model.position);
	}

	public addModel(url: string): void {
		const model = new ThreeGLBModel(url, undefined, this.animated, this.renderer.scene);
		this.models.push(model);
	}

}
