import { TilesRenderer } from '3d-tiles-renderer';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export abstract class ThreeRender {

	protected scene: THREE.Scene;
	protected camera: THREE.PerspectiveCamera;
	protected renderer: THREE.WebGLRenderer;
	protected animationFrame: number | undefined;

	constructor(canvas: HTMLElement) {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);
		this.renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas});
		this.init();
	}

	public abstract render(): void;

	public abstract dispose(): void;

	private init(): void {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio( window.devicePixelRatio );
		window.addEventListener('resize', this.onWindowResize);
	}

	public destroy(): void {
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
		}
		this.renderer.dispose();
		this.dispose();
		window.removeEventListener('resize', this.onWindowResize);
	}

	private onWindowResize(): void {
		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;

		this.camera.aspect = newWidth / newHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(newWidth, newHeight);
	}

	public lookAtCartesian3(point: THREE.Vector3, distance: number, angle: number): void {
		const normal = point.clone().normalize();

		const axis = new THREE.Vector3(1, 1, 1);
		axis.cross(point).normalize();

		const viewPoint = new THREE.Vector3(normal.x * distance, normal.y * distance, normal.z * distance);
		viewPoint.applyAxisAngle(axis, Math.PI / (180 / angle));

		this.camera.position.set(viewPoint.x, viewPoint.y, viewPoint.z );
		this.camera.lookAt(0, 0, 0);
	}

	public positionCamera(object: THREE.Object3D, camera: THREE.PerspectiveCamera): void {
		const box = new THREE.Box3().setFromObject(object);
		const center = box.getCenter(new THREE.Vector3());
		const size = box.getSize(new THREE.Vector3());
		const maxDimension = Math.max(size.x, size.y, size.z);
	
		camera.position.z = center.z + maxDimension;
		camera.position.x = center.x + maxDimension;
		camera.position.y = center.y + maxDimension;
		camera.lookAt(center);
	}


}


export class ThreeDeeTilesRender extends ThreeRender {
	
	private url: string;
	private center: THREE.Vector3;
	private distance: number;
	private tilesRenderer!: TilesRenderer;

	constructor(canvas: HTMLElement, url: string, center: THREE.Vector3, distance: number) {
		super(canvas);
		this.url = url;
		this.center = center;
		this.distance = distance;
		this.render();
	}

	dispose() {
		this.tilesRenderer.dispose();
	}

	render() {
		this.lookAtCartesian3(this.center, this.distance, 45);

		this.tilesRenderer = new TilesRenderer(this.url);
		this.tilesRenderer.setCamera(this.camera);
		this.tilesRenderer.setResolutionFromRenderer(this.camera, this.renderer);
		this.scene.add(this.tilesRenderer.group);		

		
		let pivotPoint = this.center.clone();
		//let newLength = pivotPoint.length() - 300;
		//pivotPoint.normalize().multiplyScalar(newLength);

		const pivot = new THREE.Object3D();
		pivot.position.set(pivotPoint.x, pivotPoint.y, pivotPoint.z);
		this.scene.add(pivot);
		pivot.add(this.camera);

		//const rotationAxis = new THREE.Vector3(3879988, 336566, 5034108).normalize();
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(this.center.clone().normalize(), 0.001); // 0.01 is the rotation angle in radians


		const renderLoop = () => {
			this.animationFrame = requestAnimationFrame(renderLoop);

			pivot.quaternion.multiply(quaternion);

			this.camera.updateMatrixWorld();
			this.tilesRenderer.update();
			this.renderer.render(this.scene, this.camera);
		}

		renderLoop();
	}

}



export class GLBRender extends ThreeRender {

	private url: string;
	private models: Array<ThreeGLBModel> = [];

	private animated: boolean;
	private clock: THREE.Clock | undefined;

	constructor(canvas: HTMLElement, url: string, animated: boolean) {
		super(canvas);
		this.url = url;
		this.animated = animated;
		if (this.animated) this.clock = new THREE.Clock();
		this.render();
	}

	dispose() {
	}

	render() {

		this.addModel(this.url, new THREE.Vector3(0,0,0));
		this.addModel(this.url, new THREE.Vector3(100,0,100));
		this.addModel(this.url, new THREE.Vector3(-100,0,-100));

		new ThreeTerrainModel(this.scene, 2, 300, 300, 100, 100);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
		directionalLight.position.set(5, 5, 5); // Adjust the position of the light
		this.scene.add(directionalLight);


		const flightPath = new FlightPath(
			[
				new THREE.Vector3(200, 50, 200),
				new THREE.Vector3(200, 50, -200),
				new THREE.Vector3(200, 50, 200)
			], 
			0.0001
		);


		const renderLoop = () => {
			this.animationFrame = requestAnimationFrame(renderLoop);

			flightPath.updateCamera(this.camera);
			
			if (this.animated && this.clock) {
				const delta = this.clock.getDelta();
				this.models.forEach(model => model.updateAnimation(delta));
			}

			this.renderer.render(this.scene, this.camera);
		};

		renderLoop();
	}

	public addModel(url: string, position: THREE.Vector3): void {
		const model = new ThreeGLBModel(url, this.scene, position, this.animated);
		this.models.push(model);
	}
}


class ThreeGLBModel {

	private scene: THREE.Scene;
	private position: THREE.Vector3;
	private animated: boolean;
	public model!: THREE.Object3D;
	private mixer!: THREE.AnimationMixer;

	constructor(url: string, scene: THREE.Scene, position: THREE.Vector3, animated: boolean) {
		this.scene = scene;
		this.position = position;
		this.animated = animated;
		this.loadModel(url);
	}

	private loadModel(url: string): void {
		const loader = new GLTFLoader();
		loader.load(url, (glb) => {
			this.model = glb.scene;
			this.model.position.set(this.position.x, this.position.y, this.position.z);
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

	private scene: THREE.Scene;
	private relief: number;
	private geometry: THREE.PlaneGeometry;
    private wireframe: THREE.LineSegments;

    constructor(scene: THREE.Scene, relief: number = 0, width: number, height: number, widthSegments: number, heightSegments: number) {
		this.scene = scene;
		this.relief = relief;
		this.geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
		if (this.relief > 0) this.addRelief(this.geometry);
        const wireframeGeometry = new THREE.WireframeGeometry(this.geometry);
        this.wireframe = new THREE.LineSegments(wireframeGeometry, new THREE.LineBasicMaterial());
		this.wireframe.frustumCulled = false; // Set frustumCulled to false to prevent the wireframe from affecting the viewer size
		this.wireframe.rotation.x = -Math.PI / 2; 
        this.scene.add(this.wireframe);
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




export class EarthRender extends ThreeRender {

	private texture: string;
	private size: number;	

	constructor(canvas: HTMLElement, texture: string, size: number) {
		super(canvas);
		this.texture = texture;
		this.size = size;
		this.render();
	}

	dispose() {
	}

	render() {
		const segments = this.size * 10;
		const geometry = new THREE.SphereGeometry(this.size, segments, segments);
		const texture = new THREE.TextureLoader().load(this.texture);
		const material = new THREE.MeshPhongMaterial({map: texture});
		const earth = new THREE.Mesh(geometry, material);
		this.scene.add(earth);

		// Create the moon
        const moonGeometry = new THREE.SphereGeometry(this.size / 4, segments, segments);
        const moonTexture = new THREE.TextureLoader().load("https://www.shutterstock.com/image-photo/textured-surface-moon-earths-satellite-260nw-1701426850.jpg");
        const moonMaterial = new THREE.MeshPhongMaterial({map: moonTexture});
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(12, 0, 0);
        this.scene.add(moon);


		const light = new THREE.HemisphereLight(0xffffff, 0x000000, 3);
		light.position.set(1, 0, 0);
		this.scene.add(light);

		this.camera.position.z = 20;

		const renderLoop = () => {
			this.animationFrame = requestAnimationFrame(renderLoop);
			earth.rotation.y += 0.0008;

			 // Rotate the moon around the Earth at a fixed incline
			 const angle = -Date.now() / 2000;
			 const radius = 14;
			 const incline = Math.PI / 36; // 5 degrees
			 moon.position.x = radius * Math.cos(angle);
			 moon.position.y = radius * Math.sin(incline) * Math.sin(angle);
			 moon.position.z = radius * Math.cos(incline) * Math.sin(angle);
	 

			this.renderer.render(this.scene, this.camera);
		};

		renderLoop();
	}
}
