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


export function geodeticToCartesian(lat: number, lon: number, height = 0) {
    const a = 6378137.0; // semi-major axis
    const f = 1 / 298.257223563; // flattening
    const e = Math.sqrt(2 * f - f * f); // first eccentricity

    const N = a / Math.sqrt(1 - e * e * Math.sin(lat) * Math.sin(lat));

    const x = (N + height) * Math.cos(lat) * Math.cos(lon);
    const y = (N + height) * Math.cos(lat) * Math.sin(lon);
    const z = ((1 - e * e) * N + height) * Math.sin(lat);

    return { x, y, z };
}


export function lookAtCartesian3(camera: THREE.Camera, point: THREE.Vector3, distance: number, angle: number): void {
	const normal = point.clone().normalize();

	const axis = new THREE.Vector3(1, 1, 1);
	axis.cross(point).normalize();

	const viewPoint = new THREE.Vector3(normal.x * distance, normal.y * distance, normal.z * distance);
	viewPoint.applyAxisAngle(axis, Math.PI / (180 / angle));

	camera.position.set(viewPoint.x, viewPoint.y, viewPoint.z );
	camera.lookAt(0, 0, 0);
}