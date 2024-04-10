import { writable, type Unsubscriber, type Writable, get } from 'svelte/store';
import * as THREE from 'three';
import gsap from 'gsap';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import type { BatchedGLBRender, GLBRender } from './renders/glb-render';
import type { ThreeDeeTilesRender } from './renders/tiles3D-render';
import type { MeshRender } from './renders/mesh-render';


import { DigiTwinRender } from './renders/digitwin-render';
import { TerrainRender } from './renders/terrain-render';
import { EarthRender } from './renders/earth-render';
import { DataCore } from './renders/datacore-render';
import { addCameraControls } from './render-helpers';
import { WindRender } from './renders/wind-render';
import { SubsurfaceRender } from './renders/subsurface-render';

export class RenderHandler {

	public canvas!: HTMLElement;
	public scene: THREE.Scene;
	public camera!: THREE.PerspectiveCamera;
	public renderer!: THREE.WebGLRenderer;
	protected animationFrame: number | undefined;
	private selectedIndexUnsubscriber!: Unsubscriber;

	public renderCallbacks: Array<() => void> = [];
	
	public progress: { value: number };
	public progressWritable: Writable<number>;
	public selectedIndex: Writable<number>;
	public clock: THREE.Clock = new THREE.Clock();
	public pivot: THREE.Object3D = new THREE.Object3D();

	private digiTwin!: DigiTwinRender;
	private terrain!: TerrainRender;
	private earth!: EarthRender;
	private dataCore!: DataCore;
	private wind!: WindRender;
	private subsurface!: SubsurfaceRender;

	private windmills!: GLBRender;
	private bim!: BatchedGLBRender;
	private spiral!: MeshRender;
	private sogelinkOffice!: ThreeDeeTilesRender;

	private datgui: any;

	constructor(selectedIndex: Writable<number>) {
		this.scene = new THREE.Scene();
		this.selectedIndex = selectedIndex;
		this.progress = { value: get(this.selectedIndex) };
		this.progressWritable = writable(this.progress.value);
	}

	public init(canvas: HTMLElement): void {
		this.canvas = canvas;
		this.camera = new THREE.PerspectiveCamera(70, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 10000);
		this.renderer = new THREE.WebGLRenderer({alpha: true, canvas: this.canvas, antialias: true});
		//this.renderer.setPixelRatio(window.devicePixelRatio * 0.8);
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;

		this.renderer.shadowMap.enabled = true;

		this.setRendererSize();
		window.addEventListener('resize', () => this.setRendererSize());

		this.pivot.position.set(0, 0, 0);
		//this.pivot.add(this.camera);
		this.scene.add(this.pivot);

		this.progress = { value: get(this.selectedIndex) };
		this.progressWritable.set(this.progress.value);
		this.selectedIndexUnsubscriber = this.selectedIndex.subscribe((index) => {
			this.onIndexUpdate(index);
		});

		if (!this.digiTwin) this.digiTwin = new DigiTwinRender(this, 0, 1);
		if (!this.terrain) this.terrain = new TerrainRender(this, 0, 1);
		if (!this.earth) this.earth = new EarthRender(this, 1, 5);
		if (!this.dataCore) this.dataCore = new DataCore(this, 5, 11);
		if (!this.wind) this.wind = new WindRender(this, 14, 15);
		if (!this.subsurface) this.subsurface = new SubsurfaceRender(this, 15, 16);
		this.digiTwin.init();
		this.terrain.init();
		this.earth.init();
		this.dataCore.init();
		this.wind.init();
		this.subsurface.init();

		this.render();
		
		new OrbitControls(this.camera, this.canvas);
		//addCameraControls(this.camera).then((gui: any) => this.datgui = gui);
		//const axesHelper = new THREE.AxesHelper(25);
		//this.scene.add(axesHelper);
		
	}

	public detach(): void {
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
		}
		this.renderer.dispose();
		window.removeEventListener('resize', () => this.setRendererSize());
		if (this.selectedIndexUnsubscriber) this.selectedIndexUnsubscriber();

		this.datgui?.destroy();
	}


	private setRendererSize(): void {
		const width = this.canvas.clientWidth;
		const height = this.canvas.clientHeight;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
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

	private render(): void {
		const renderLoop = () => {
			this.animationFrame = requestAnimationFrame(renderLoop);
			for (const callback of this.renderCallbacks) {
				callback();
			}
			this.renderer.render(this.scene, this.camera);
		}
		renderLoop();
	}


	private onIndexUpdate(index: number | undefined): void {
		if (index !== undefined) {
			gsap.to(this.progress, { 
				value: index, 
				duration: 1,
				easing: "none",
				onUpdate: () => this.progressWritable.set(this.progress.value) 
			});
		}
	}

}