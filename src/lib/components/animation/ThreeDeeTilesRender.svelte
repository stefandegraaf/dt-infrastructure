<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { TilesRenderer } from '3d-tiles-renderer';
import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export let url: string;
export let translate: Array<number> = [0, 0, 0];
export let canvas: HTMLElement;


//onMount(() => renderSimpleCube());

//onMount(() => renderGLB());

//onMount(() => renderTilesRenderer());

onMount(() => {
	renderTilesRenderer();
});



function renderTilesRenderer(): void {

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		70, // Field of view
		window.innerWidth / window.innerHeight, // Aspect ratio
		0.1, // Near clipping plane
		10000 // Far clipping plane
	);

	const renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas});
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);


	const normal = new THREE.Vector3(translate[0], translate[1], translate[2]).normalize();
	const dist = 500;
	camera.position.set(normal.x * dist, normal.y * dist, normal.z * dist);

	

	const tilesRenderer = new TilesRenderer(url);
	tilesRenderer.setCamera(camera);
	tilesRenderer.setResolutionFromRenderer(camera, renderer);
	scene.add(tilesRenderer.group);

	let matrix = new THREE.Matrix4();
	//Hoevesteijn
	//matrix.set(1.0, 0.0, 0.0, 3920023.0, 0.0, 1.0, 0.0, 351558.875, 0.0, 0.0, 1.0, 5002181.0, 0.0, 0.0, 0.0, 1.0);

	//Moerdijk
	//matrix.set(1.0, 0.0, 0.0, 3946686.0, 0.0, 1.0, 0.0, 320078.875, 0.0, 0.0, 1.0, 4983419.0, 0.0, 0.0, 0.0, 1.0);

	//Tenpost
	//matrix.set(1.0, 0.0, 0.0, 3793553.0, 0.0, 1.0, 0.0, 447896.0, 0.0, 0.0, 1.0, 5090624.0, 0.0, 0.0, 0.0, 1.0);

	//DTB
	//matrix.set(1.0, 0.0, 0.0, 3926979.0, 0.0, 1.0, 0.0, 375783.875, 0.0, 0.0, 1.0, 4995008.0, 0.0, 0.0, 0.0, 1.0);

	//Cross sections
	//matrix.set(1.0, 0.0, 0.0, 3874859.0, 0.0, 1.0, 0.0, 338846.875, 0.0, 0.0, 1.0, 5037906.0, 0.0, 0.0, 0.0, 1.0);

	//Ilpendam
	//matrix.set(1.0, 0.0, 0.0, 3879988.0, 0.0, 1.0, 0.0, 336566.0, 0.0, 0.0, 1.0, 5034108.0, 0.0, 0.0, 0.0, 1.0);

	/*
	camera.matrix.copy(matrix);
	camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
	camera.updateMatrixWorld(true);
	*/

	const pivot = new THREE.Object3D();
	pivot.position.set(3879988, 336566, 5034108 );
	scene.add(pivot);
	//pivot.add(camera);
	

	tilesRenderer.onLoadTileSet = (tileSet) => {
		console.log('Tileset loaded', tileSet);
	};
	tilesRenderer.onLoadModel = (group, tile) => {
		console.log('Model loaded', group, tile);
		//updateCamera(group);
	};
	let updated = false;
	function updateCamera(group: THREE.Object3D<THREE.Object3DEventMap>) {
		if (updated) return;
		updated = true;
		const boundingBox = new THREE.Box3().setFromObject(group); // Get the bounding box of the scene
		const center = boundingBox.getCenter(new THREE.Vector3()); // Get the center of the bounding box
		camera.position.set(center.x, center.y, boundingBox.max.z + 2000); // Adjust camera position based on the scene size
		camera.lookAt(center);
	}
	//const boundingBox = new THREE.Box3().setFromObject(scene); // Get the bounding box of the scene
	//const center = boundingBox.getCenter(new THREE.Vector3()); // Get the center of the bounding box

	//camera.position.set(center.x, center.y, boundingBox.max.z * 2); // Adjust camera position based on the scene size
	//camera.lookAt(center); // Make the camera look at the center of the scene


	//renderer.render(scene, camera);

	const rotationAxis = new THREE.Vector3(3879988, 336566, 5034108).normalize();
	//const rotationAxis = new THREE.Vector3(0, 0, 1);
	const quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle(rotationAxis, 0.01); // 0.01 is the rotation angle in radians


	renderLoop();

	function renderLoop() {

		requestAnimationFrame(renderLoop);
		pivot.quaternion.multiply(quaternion);
		
		//pivot.quaternion.multiplyQuaternions(pivot.quaternion, quaternion);
		//pivot.rotation.x += 0.01;
		// The camera matrix is expected to be up to date
		// before calling tilesRenderer.update
		camera.updateMatrixWorld();
		tilesRenderer.update();
		renderer.render(scene, camera);

	}

}

function addCube(scene: THREE.Scene): void {
	const geometry = new THREE.BoxGeometry();

	// Create a basic material
	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

	// Create a mesh by combining geometry and material
	const cube = new THREE.Mesh(geometry, material);
	console.log(cube);
	cube.position.set(0, 0, 0);
	// Add the cube to the scene
	scene.add(cube);
	
}



</script>


<canvas id="canvas"></canvas>


<style>

canvas {
	width: 100%;
	height: 100%;
	display: block;

}
</style>