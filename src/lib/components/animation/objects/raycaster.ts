import * as THREE from 'three';


export class RaycasterBase {

	private raycaster: THREE.Raycaster = new THREE.Raycaster();
	private mouse: THREE.Vector2 = new THREE.Vector2();
	private mouseIsOnCanvas: boolean = false;

	constructor(canvas: HTMLElement) {
		let rect = canvas.getBoundingClientRect();
		canvas.addEventListener('mousemove', (event) => {
			if (!this.mouseIsOnCanvas) return;
			this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;		
		}, false);

		canvas.addEventListener('mouseenter', () => {
			this.mouseIsOnCanvas = true;
		});
		canvas.addEventListener('mouseleave', () => {
			this.mouseIsOnCanvas = false;
		});
		window.addEventListener('scroll', (event) => {
			rect = canvas.getBoundingClientRect();
		});
	}

	public checkIntersection(object: THREE.Object3D, camera: THREE.PerspectiveCamera): boolean {
		if (!this.mouseIsOnCanvas) return false;
		this.raycaster.setFromCamera(this.mouse, camera);
		const intersects = this.raycaster.intersectObject(object, true);
		return intersects.length > 0;
	}

}