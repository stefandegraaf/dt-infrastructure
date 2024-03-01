import * as THREE from 'three';
import type { ThreeRenderComplete } from "../render-complete";


export abstract class ThreeRenderAbstract {

	public renderer: ThreeRenderComplete;
	public boundRenderLoop!: () => void;
	public start: number;
	public end: number;

	public added: boolean = false;

	constructor(renderer: ThreeRenderComplete, start: number, end: number) {
		this.renderer = renderer;
		this.start = start;
		this.end = end;
	}

	public destroy(): void {
		this.dispose();
	}

	public add(): void {
		this.addToScene();
		this.boundRenderLoop = this.render.bind(this);
		this.renderer.renderCallbacks.push(this.boundRenderLoop);
		this.added = true;
	}

	public dispose(): void {
		const index = this.renderer.renderCallbacks.indexOf(this.boundRenderLoop);
		if (index > -1) {
			this.renderer.renderCallbacks.splice(index, 1);
		}
		this.disposeFromScene();
		this.added = false;
	}

	protected abstract addToScene(): void;

	protected abstract disposeFromScene(): void;

	protected abstract construct(): void;

	protected abstract render(): void;

	protected abstract onStepChange(step: number): void;
	
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