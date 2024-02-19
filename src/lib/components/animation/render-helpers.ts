import * as THREE from 'three';

export function addSphere(scene: THREE.Scene, model: THREE.Object3D) {
	const sphere = new THREE.Sphere();
	new THREE.Box3().setFromObject(model).getBoundingSphere(sphere);

	// Create a wireframe sphere with the same center and radius
	const geometry = new THREE.SphereGeometry(sphere.radius, 32, 32);
	const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
	const wireframeSphere = new THREE.Mesh(geometry, material);
	wireframeSphere.position.copy(sphere.center);

	// Add the wireframe sphere to the scene
	scene.add(wireframeSphere);
}