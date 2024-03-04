<script lang="ts">
	import { onDestroy } from 'svelte';
	import * as THREE from 'three';

	import { GLTFLoader } from 'three/examples/jsm/Addons';
	//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

	export let glbUrl: string;


	let animationFrame: number;
	onDestroy(() => {
		if (animationFrame) cancelAnimationFrame(animationFrame);
	});

	function renderGLB(): void {
		const canvas = document.getElementById('canvas');
		if (!canvas) {
			throw new Error('Canvas not found');
		}
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer({ alpha: true, canvas: canvas });
		renderer.setSize(canvas.clientWidth, canvas.clientHeight);

		
		const loader = new GLTFLoader();

		// Load the GLB model
		let model: THREE.Object3D;
		loader.load(glbUrl, (gltf) => {
			model = gltf.scene;
			scene.add(model);
		});

		const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
		directionalLight.position.set(5, 5, 5); // Adjust the position of the light
		scene.add(directionalLight);


		camera.position.z = 115;

		const animate = function () {
			animationFrame = requestAnimationFrame(animate);

			// Rotate the model (if needed)
			if (model) {
				model.rotation.y += 0.01;
			}

			renderer.render(scene, camera);
		};

		window.addEventListener('resize', function () {
			const newWidth = window.innerWidth;
			const newHeight = window.innerHeight;

			camera.aspect = newWidth / newHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(newWidth, newHeight);
		});

		animate();
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