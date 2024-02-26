import type { ThreeRenderComplete } from "../render-complete";

export abstract class ThreeRenderAbstract {

	public renderer: ThreeRenderComplete;
	private boundRenderLoop!: () => void;
	public added: boolean = false;
	public progress: number = 0;

	constructor(renderer: ThreeRenderComplete) {
		this.renderer = renderer;
	}

	public init(): void {
		this.render();
		this.add();
	}

	public add(): void {
		if (this.added) return;
		this.added = true;
		this.addToScene();
		this.boundRenderLoop = this.renderLoop.bind(this);
		this.renderer.renderCallbacks.push(this.boundRenderLoop);
	}

	public dispose(): void {
		if (!this.added) return;
		this.added = false;
		const index = this.renderer.renderCallbacks.indexOf(this.boundRenderLoop);
		if (index > -1) {
			this.renderer.renderCallbacks.splice(index, 1);
		}
		this.disposeFromScene();
	}

	protected abstract addToScene(): void;

	protected abstract disposeFromScene(): void;

	protected abstract show(): void;

	protected abstract hide(): void;

	protected abstract render(): void;

	protected abstract renderLoop(): void;
	
}


/*
import * as THREE from 'three';
import type { ThreeRenderComplete } from '../render-complete';
import { ThreeRenderAbstract } from './render-base';

export class SkeletonRender extends ThreeRenderAbstract {

	private mesh!: THREE.Mesh;


	constructor(renderer: ThreeRenderComplete) {
		super(renderer);
		this.init();
	}

	addToScene() {
		this.renderer.scene.add(this.mesh);
	}

	disposeFromScene() {
		this.renderer.scene.remove(this.mesh);
	}

	show() {
		this.mesh.visible = true;
	}

	hide() {
		this.mesh.visible = false;
	}

	render() {
	
	}

	renderLoop() {

	}
}
*/