import { writable, type Unsubscriber, type Writable, get } from 'svelte/store';
import * as THREE from 'three';
import gsap from 'gsap';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import type { BatchedGLBRender, GLBRender } from './renders/glb-render';
import type { ThreeDeeTilesRender } from './renders/tiles3D-render';
import type { MeshRender } from './renders/mesh-render';
import type { TerrainRender } from './renders/terrain-render';

import { EarthRender } from './renders/earth-render';
import { DataCore } from './renders/datacore-render';
import { DigiTwinRender } from './renders/digitwin-render';

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
	private earth!: EarthRender;
	private dataCore!: DataCore;

	private windmills!: GLBRender;
	private bim!: BatchedGLBRender;
	private spiral!: MeshRender;
	private sogelinkOffice!: ThreeDeeTilesRender;
	private terrain!: TerrainRender;

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
		this.renderer.setPixelRatio(window.devicePixelRatio * 0.8);
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;

		new OrbitControls(this.camera, this.canvas);

		this.setRendererSize();
		window.addEventListener('resize', () => this.setRendererSize());

		this.pivot.add(this.camera);
		this.scene.add(this.pivot);

		this.progress = { value: get(this.selectedIndex) };
		this.progressWritable.set(this.progress.value);
		this.selectedIndexUnsubscriber = this.selectedIndex.subscribe((index) => {
			this.onIndexUpdate(index);
		});

		if (!this.digiTwin) this.digiTwin = new DigiTwinRender(this, 0, 1);
		if (!this.earth) this.earth = new EarthRender(this, 1, 5);
		if (!this.dataCore) this.dataCore = new DataCore(this, 5, 11);
		this.digiTwin.init();
		this.earth.init();
		this.dataCore.init();

		this.render();
	}

	public detach(): void {
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
		}
		this.renderer.dispose();
		window.removeEventListener('resize', () => this.setRendererSize());
		if (this.selectedIndexUnsubscriber) this.selectedIndexUnsubscriber();
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
				onUpdate: () => this.progressWritable.set(this.progress.value) 
			});
		}
		/*
		switch (index) {
			case 0:
				if (!this.digiTwin) this.digiTwin = new DigiTwinRender(this, 0, 1);
			case 1:
				if (!this.earth) this.earth = new EarthRender(this, 1, 4);
			/*
			case 0:
				this.earth ? this.earth.add() : this.earth = new EarthRender(this, './src/lib/files/textures/8k_earth_daymap.jpg', 6);
				this.earth.setRealistic();
				break;
			case 1:
				this.earth ? this.earth.add() : this.earth = new EarthRender(this, './src/lib/files/textures/8k_earth_daymap.jpg', 6);
				this.earth.setRealistic();
				/*
				if (!this.particles) {
					this.particles = new Particles(this);
				} else {
					this.particles.add();
				}
				/
				break;
			case 2:
				this.earth ? this.earth.add() : this.earth = new EarthRender(this, './src/lib/files/textures/8k_earth_daymap.jpg', 6);
				this.earth.setDotted();
				break;
			case 3:
				this.earth?.dispose();
				break;
			case 4:
				this.windmills?.dispose();
				break;
			case 5:
				this.windmills ? this.windmills.add() : this.windmills = new GLBRender(this, 'https://storage.googleapis.com/ahp-research/maquette/models/sm_windturbine.glb', true);
				break;
			case 6:
				this.windmills?.dispose();
				this.bim?.dispose();
				break;
			case 7:
				this.bim ? this.bim.add() : this.bim = new BatchedGLBRender(this, [
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_geul_nl_1_8/content/1_1_0.glb",
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_geul_nl_1_8/content/1_1_1.glb",/*
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_old/content/2_0_0.glb",
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_old/content/2_0_1.glb",
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_old/content/2_0_2.glb",
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_old/content/2_1_0.glb",
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_old/content/2_1_3.glb",
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_old/content/2_2_0.glb",
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_old/content/2_2_3.glb"/
				], true);
				break;
			case 8:
				this.bim?.dispose();
				break;
			case 9:
				this.spiral?.dispose();
				break;
			case 10:
				this.spiral ? this.spiral.add() : this.spiral = new MeshRender(this);
				break;
			case 11:
				this.spiral?.dispose();
				this.sogelinkOffice?.dispose();
				break;
			case 12:
				this.sogelinkOffice ? this.sogelinkOffice.add() : this.sogelinkOffice = new ThreeDeeTilesRender(this, "https://storage.googleapis.com/ahp-research/projects/sogelink/hackathon/ifc/existing_building/tileset.json");
				break;
			case 13:
				this.sogelinkOffice?.dispose();
				this.terrain?.dispose();
				break;
			case 14:
				this.terrain ? this.terrain.add() : this.terrain = new TerrainRender(this);
				break;
			case 15:
				this.terrain?.dispose();
				this.dataCore?.dispose();
				break;
			case 16:
				this.dataCore ? this.dataCore.add() : this.dataCore = new DataCore(this);
				break;
			case 17:
				this.dataCore?.dispose();
				this.digiTwin?.dispose();
				break;
			case 18:
				this.digiTwin ? this.digiTwin.add() : this.digiTwin = new DigiTwinRender(this);
				break;
			default:
				break;
		

		}*/
	}

}

