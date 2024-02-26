import type { Unsubscriber, Writable } from 'svelte/store';
import * as THREE from 'three';

import { BatchedGLBRender, GLBRender } from './renders/glb-render';
import { EarthRender } from './renders/earth-render';
import { ThreeDeeTilesRender } from './renders/tiles3D-render';
import { MeshRender } from './renders/mesh-render';

export class ThreeRenderComplete {

	public canvas: HTMLElement;
	public scene: THREE.Scene;
	public camera: THREE.PerspectiveCamera;
	public renderer: THREE.WebGLRenderer;
	protected animationFrame: number | undefined;
	private selectedIndexUnsubscriber: Unsubscriber;

	public renderCallbacks: Array<() => void> = [];

	private earth!: EarthRender;
	private particles!: Particles;
	private windmills!: GLBRender;
	private bim!: BatchedGLBRender;
	private spiral!: MeshRender;
	private sogelinkOffice!: ThreeDeeTilesRender;

	constructor(canvas: HTMLElement, selectedIndex: Writable<number | undefined>) {
		this.canvas = canvas;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(70, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 10000);
		this.renderer = new THREE.WebGLRenderer({alpha: true, canvas: this.canvas, antialias: true});
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.init();
		this.render();

		this.selectedIndexUnsubscriber = selectedIndex.subscribe((index) => {
			this.onIndexUpdate(index);
		});
	}

	private init(): void {
		this.renderer.setPixelRatio(window.devicePixelRatio * 0.8);
		this.setRendererSize();
		window.addEventListener('resize', () => this.setRendererSize());
	}

	public destroy(): void {
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
		}
		this.renderer.dispose();
		this.selectedIndexUnsubscriber();
		window.removeEventListener('resize', () => this.setRendererSize());
	}

	private destroyAllRenders(): void {
		this.earth?.dispose();
		this.particles?.dispose();
		this.windmills?.dispose();
		this.bim?.dispose();
		this.scene.traverse(object => {
			if (!(object instanceof THREE.Mesh)) return;
			object.geometry.dispose();
		});
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
			//this.renderer.render(this.scene, this.camera);
		}
		renderLoop();
	}


	private onIndexUpdate(index: number | undefined): void {
		switch (index) {
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
				}*/
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
					"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_old/content/2_2_3.glb"*/
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
			default:
				break;
		}
	}


	// Per step, update camera position and lighting
}


//Tenpost
//matrix.set(1.0, 0.0, 0.0, 3793553.0, 0.0, 1.0, 0.0, 447896.0, 0.0, 0.0, 1.0, 5090624.0, 0.0, 0.0, 0.0, 1.0);

class Particles {

	private renderer: ThreeRenderComplete;

	private particles!: THREE.BufferGeometry;
	private particleMaterial!: THREE.PointsMaterial;
	private particleSystem!: THREE.Points;

	private boundRenderLoop!: () => void;
	
	constructor(renderer: ThreeRenderComplete) {
		this.renderer = renderer;
		this.render();
		this.add();
	}

	public add(): void {
		this.renderer.scene.add(this.particleSystem);
		this.boundRenderLoop = this.renderLoop.bind(this);
		this.renderer.renderCallbacks.push(this.boundRenderLoop);
	}

	public dispose(): void {
		const index = this.renderer.renderCallbacks.indexOf(this.boundRenderLoop);
		if (index > -1) {
			this.renderer.renderCallbacks.splice(index, 1);
		}
		this.renderer.scene.remove(this.particleSystem);
	}

	private render(): void {
		const particleCount = 1000;
		this.particles = new THREE.BufferGeometry();
		const positions = new Float32Array(particleCount * 3);
		const speeds = new Float32Array(particleCount * 3);
		this.particleMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1, transparent: false });
		this.particleMaterial.opacity = 1.0;

		const centerPoint = new THREE.Vector3(0, 0, 0);

		for (let i = 0; i < particleCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			const radius = Math.random() * 2 + 5;

			positions[i * 3] = centerPoint.x + Math.cos(angle) * radius;
			positions[i * 3 + 1] = centerPoint.y + Math.sin(angle) * radius;
			positions[i * 3 + 2] = centerPoint.z + (Math.random() - 0.5) * 2 + 5;

			speeds[i * 3] = (Math.random() - 0.5) / 100;
			speeds[i * 3 + 1] = (Math.random() - 0.5) / 1000;
			speeds[i * 3 + 2] = (Math.random() - 0.5) / 1000;
		}


		this.particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		this.particles.setAttribute('speed', new THREE.BufferAttribute(speeds, 3));


		this.particleSystem = new THREE.Points(this.particles, this.particleMaterial);
		this.renderer.camera.position.z = 10;
	}

	private renderLoop(): void {
		const centerPoint = new THREE.Vector3(0, 0, 0);

		const positionAttribute = this.particles.getAttribute('position');
		const speedAttribute = this.particles.getAttribute('speed');
		for (let i = 0; i < positionAttribute.array.length; i += 3) {
			const speedX = speedAttribute.array[i];
			const speedY = speedAttribute.array[i + 1];
			const speedZ = speedAttribute.array[i + 2];

			// Convert from Cartesian to spherical coordinates
			const r = Math.sqrt(
				Math.pow(positionAttribute.array[i] - centerPoint.x, 2) +
				Math.pow(positionAttribute.array[i + 1] - centerPoint.y, 2) +
				Math.pow(positionAttribute.array[i + 2] - centerPoint.z, 2)
			);

			const theta = Math.atan2(
				positionAttribute.array[i + 1] - centerPoint.y,
				positionAttribute.array[i] - centerPoint.x
			);

			const phi = Math.acos(
				(positionAttribute.array[i + 2] - centerPoint.z) / r
			);

			// Update angles
			const newTheta = (theta + speedX) % (2 * Math.PI);
			const newPhi = Math.max(0, Math.min(Math.PI, phi + speedY));

			// Convert from spherical back to Cartesian coordinates
			positionAttribute.array[i] = r * Math.sin(newPhi) * Math.cos(newTheta);
			positionAttribute.array[i + 1] = r * Math.sin(newPhi) * Math.sin(newTheta);
			positionAttribute.array[i + 2] = r * Math.cos(newPhi);

			// Update angles for next iteration
			speedAttribute.array[i] += (Math.random() - 0.5) / 10000;
			speedAttribute.array[i + 1] += (Math.random() - 0.5) / 10000;
			speedAttribute.array[i + 2] += (Math.random() - 0.5) / 10000;

			// Fade out the particles
			this.particleMaterial.opacity = Math.max(0, this.particleMaterial.opacity - 0.002);
    	}
	  positionAttribute.needsUpdate = true;
	}

}


class ParticleMesh {

	private renderer: ThreeRenderComplete;

	private instancedMesh!: THREE.InstancedMesh;
	private particlesData!: Float32Array;
	private positions!: Float32Array;
	private particleMaterial!: THREE.PointsMaterial;
	private particleSystem!: THREE.Points;

	private boundRenderLoop!: () => void;
	
	constructor(renderer: ThreeRenderComplete) {
		this.renderer = renderer;
		this.render();
		this.add();
	}

	public add(): void {
		this.renderer.scene.add(this.instancedMesh);
		this.boundRenderLoop = this.renderLoop.bind(this);
		this.renderer.renderCallbacks.push(this.boundRenderLoop);
	}

	public dispose(): void {
		const index = this.renderer.renderCallbacks.indexOf(this.boundRenderLoop);
		if (index > -1) {
			this.renderer.renderCallbacks.splice(index, 1);
		}
		this.renderer.scene.remove(this.particleSystem);
	}

	private getRandomInRange(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}

	private render(): void {
		const particleCount = 100;
		this.positions = new Float32Array(particleCount * 3);
		this.particlesData = new Float32Array(particleCount * 3);

		for (let i = 0; i < particleCount; i++) {
			this.particlesData[i * 3] = this.getRandomInRange(0, 100); // Time
			this.particlesData[i * 3 + 1] = this.getRandomInRange(20, 120); // Factor
			this.particlesData[i * 3 + 2] = this.getRandomInRange(0.01, 0.015) / 2; // Speed

			this.positions[i * 3] = this.getRandomInRange(-50, 50); // X
			this.positions[i * 3 + 1] = this.getRandomInRange(-50, 50); // Y
			this.positions[i * 3 + 2] = this.getRandomInRange(-50, 50); // Z
		}

		const particleGeometry = new THREE.SphereGeometry(0.8);

		particleGeometry.setAttribute('particleData', new THREE.BufferAttribute(this.particlesData, 3));

		// Material
		const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
		//const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
		this.instancedMesh = new THREE.InstancedMesh(particleGeometry, material, particleCount);
		for (let i = 0; i < particleCount; i++) {
			const matrix = new THREE.Matrix4();
			matrix.setPosition(new THREE.Vector3(this.positions[i * 3], this.positions[i * 3 + 1], this.positions[i * 3 + 2]));
			this.instancedMesh.setMatrixAt(i, matrix);
		}
		
		const light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(100, 100, 0).normalize();
		this.renderer.scene.add(light);

		// Animation
		this.renderer.camera.position.z = 100;

	}

	private renderLoop(): void {
		
		for (let i = 0; i < this.positions.length; i+=3) {

			const x = this.positions[i];
			const y = this.positions[i + 1];
			const z = this.positions[i + 2];
			const factor = this.particlesData[i + 1];
			const speed = this.particlesData[i + 2];
			const t = (this.particlesData[i] += speed);

			const dummy = new THREE.Object3D();

			dummy.position.set(
				x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
				y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
				z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
			);
		  
			// Derive an oscillating value for size and rotation
			const s = Math.sin(t);
			dummy.scale.set(s, s, s);
			dummy.rotation.set(s * 5, s * 5, s * 5);
			dummy.updateMatrix();

			this.instancedMesh.setMatrixAt(i / 3, dummy.matrix);
		}
		this.instancedMesh.instanceMatrix.needsUpdate = true;
	}

}
