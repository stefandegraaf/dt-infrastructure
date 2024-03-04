import * as THREE from 'three';
import gsap from 'gsap';


interface CameraAnimation {
	position: THREE.Vector3;
	lookAt: THREE.Vector3;
	camera: THREE.PerspectiveCamera;
	duration?: number;
	easing?: string;
}

export function animateCamera(c: CameraAnimation): gsap.core.Tween {
	gsap.killTweensOf(c.camera.position);
    gsap.killTweensOf(c.camera.quaternion);

	const dummyCamera = new THREE.PerspectiveCamera();
	dummyCamera.position.copy(c.position);
	dummyCamera.lookAt(c.lookAt.x, c.lookAt.y, c.lookAt.z);
	
	const quaternion = dummyCamera.quaternion.clone();
	const startOrientation = c.camera.quaternion.clone();

	const a = gsap.to(c.camera.position, {
		x: c.position.x,
		y: c.position.y,
		z: c.position.z,
		duration: c.duration ?? 3,
		ease: c.easing ?? 'power2.out',
		overwrite: true,
		onUpdate: () => {
			c.camera.quaternion.copy(startOrientation).slerp(quaternion, a.ratio);
			c.camera.updateProjectionMatrix();
		}
	});
	return a;	
}


export function gsapAddLight(scene: THREE.Scene, light: THREE.Light, intensity: number): void {
	gsap.killTweensOf(light);
	scene.add(light);
	light.intensity = 0;
	gsap.to(light, { 
		intensity: intensity, 
		duration: 1 
	});
}

export function gsapRemoveLight(scene: THREE.Scene, light: THREE.Light): void {
	gsap.to(light, { 
		intensity: 0, 
		duration: 1, 
		onComplete: () => {
			scene.remove(light);
		}
	});
}