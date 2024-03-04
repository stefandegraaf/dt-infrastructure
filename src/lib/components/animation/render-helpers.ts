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


export function lookAtCartesian3(camera: THREE.Camera, point: THREE.Vector3, distance: number, angle: number): any {
	const normal = point.clone().normalize();

	const axis = new THREE.Vector3(1, 1, 1);
	axis.cross(point).normalize();

	const viewPoint = new THREE.Vector3(normal.x * distance, normal.y * distance, normal.z * distance);
	viewPoint.applyAxisAngle(axis, Math.PI / (180 / angle));

	camera.position.set(viewPoint.x, viewPoint.y, viewPoint.z );
	camera.lookAt(0, 0, 0);
}


export async function addCameraControls(camera: THREE.PerspectiveCamera): Promise<any> {
	return import('dat.gui').then((dat) => {

		// Create an object with properties for the camera position and lookAt point
		let cameraControls = {
			/*posX: camera.position.x,
			posY: camera.position.y,
			posZ: camera.position.z,
			lookAtX: 0,
			lookAtY: 0,
			lookAtZ: 0,*/
			currentPosX: 0,
			currentPosY: 0,
			currentPosZ: 0,
			currentLookAtX: 0,
			currentLookAtY: 0,
			currentLookAtZ: 0,
			getCoordinates: function() {
				// Update the current coordinates with the camera position and lookAt point
				this.currentPosX = camera.position.x;
				this.currentPosY = camera.position.y;
				this.currentPosZ = camera.position.z;
				let vector = new THREE.Vector3(0, 0, -1);
				vector.applyQuaternion(camera.quaternion);
				let lookAtPoint = vector.multiplyScalar(100).add(camera.position);
				this.currentLookAtX = lookAtPoint.x;
				this.currentLookAtY = lookAtPoint.y;
				this.currentLookAtZ = lookAtPoint.z;
			}
		};

		// Create a new dat.GUI instance
		let gui = new dat.GUI();

		// Add controls for the camera position
		/*
		gui.add(cameraControls, 'posX').onChange((value) => {
			camera.position.x = value;
		});
		gui.add(cameraControls, 'posY').onChange((value) => {
			camera.position.y = value;
		});
		gui.add(cameraControls, 'posZ').onChange((value) => {
			camera.position.z = value;
		});

		// Add controls for the lookAt point
		gui.add(cameraControls, 'lookAtX').onChange((value) => {
			camera.lookAt(new THREE.Vector3(value, cameraControls.lookAtY, cameraControls.lookAtZ));
		});
		gui.add(cameraControls, 'lookAtY').onChange((value) => {
			camera.lookAt(new THREE.Vector3(cameraControls.lookAtX, value, cameraControls.lookAtZ));
		});
		gui.add(cameraControls, 'lookAtZ').onChange((value) => {
			camera.lookAt(new THREE.Vector3(cameraControls.lookAtX, cameraControls.lookAtY, value));
		});
		*/

		gui.add(cameraControls, 'currentPosX').listen().name('Current Pos X');
		gui.add(cameraControls, 'currentPosY').listen().name('Current Pos Y');
		gui.add(cameraControls, 'currentPosZ').listen().name('Current Pos Z');
		gui.add(cameraControls, 'currentLookAtX').listen().name('Current LookAt X');
		gui.add(cameraControls, 'currentLookAtY').listen().name('Current LookAt Y');
		gui.add(cameraControls, 'currentLookAtZ').listen().name('Current LookAt Z');
		gui.add(cameraControls, 'getCoordinates').name('Get Camera Coordinates');

		return gui;
	});
}

