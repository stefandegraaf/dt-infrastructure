<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { TilesRenderer, B3DMLoader } from '3d-tiles-renderer';
	import * as THREE from 'three';
  
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

	const glbs = [
		"https://storage.googleapis.com/ahp-research/projects/communicatie/images/tree.glb",
		"https://storage.googleapis.com/ahp-research/maquette/models/ship_c.glb",
		"https://storage.googleapis.com/ahp-research/maquette/models/sm_windturbine.glb"
	]

	const tilesets = [
		//"https://storage.googleapis.com/ahp-research/maquette/tki/hhnk/ondergrondmodel/cross_sections/221205/tileset.json",
		//"https://storage.googleapis.com/ahp-research/maquette/kadaster/bim/hoevesteijn/hoevesteijn_gebouw_offset/tileset.json",
		//"https://storage.googleapis.com/ahp-research/maquette/rws/moerdijk_rvt/moerdijkbrug_tiles/tileset.json",
		//"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_nl_1_8/tileset.json",
		//"https://storage.googleapis.com/ahp-research/maquette/bim/tenpost/bim_second/tileset.json",
		"https://storage.googleapis.com/ahp-research/maquette/tki/hhnk/pointcloud/ilpendam/tileset.json",
		//"https://nasa-ammos.github.io/3DTilesRendererJS/example/data/tileset.json",
		//"https://raw.githubusercontent.com/NASA-AMMOS/3DTilesSampleData/master/msl-dingo-gap/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_sky/0528_0260184_to_s64o256_sky_tileset.json",
		//"https://raw.githubusercontent.com/NASA-AMMOS/3DTilesSampleData/master/msl-dingo-gap/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize_tileset.json",
	];

	const tenpost = [
		"https://storage.googleapis.com/ahp-research/maquette/bim/tenpost/bim_second/tileset.json"
	]

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

	//IJsselbruggen
	//matrix.set(1.0, 0.0, 0.0, 3915674, 0.0, 1.0, 0.0, 410808, 0.0, 0.0, 1.0, 5001080, 0.0, 0.0, 0.0, 1.0);

	let canvas: HTMLElement | null;

	//onMount(() => renderSimpleCube());

	//onMount(() => renderGLB());
  
	//onMount(() => renderTilesRenderer());
	
	onMount(() => {
		canvas = document.getElementById('canvas');
		//tilesets.forEach((t) => renderB3DM(t))
		tilesets.forEach((t) => renderTilesRenderer(t))
	});

	let animationFrame: number;
	onDestroy(() => {
		if (animationFrame) cancelAnimationFrame(animationFrame);
	});

	
	function renderTilesRenderer(url: string): void {
		//return;	
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			70, // Field of view
			window.innerWidth / window.innerHeight, // Aspect ratio
			0.1, // Near clipping plane
			10000 // Far clipping plane
		);

		//const vector = new THREE.Vector3(3879988, 336566, 5034108);
		const vector = new THREE.Vector3(3879789, 336573, 5034260);
		const normal = vector.clone().normalize();
		const dist = 600;
		
		const randomVec = new THREE.Vector3(1, 1, 1);
		randomVec.cross(normal).normalize();

		const newVector = new THREE.Vector3(normal.x * dist, normal.y * dist, normal.z * dist);
		newVector.applyAxisAngle(randomVec, Math.PI / 4); //.add(vector);
		//newVector.multiplyScalar(dist);
		//camera.position.copy(newVector).add(vector);

		camera.position.set(newVector.x, newVector.y, newVector.z );
		camera.lookAt(0, 0, 0);

		const canvas = document.getElementById('canvas');
		if (!canvas) {
			throw new Error('Canvas not found');
		}

		const renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas});
		//canvas.appendChild( renderer.domElement );
		//renderer.setSize(canvas.clientWidth, canvas.clientHeight);
		

		const tilesRenderer = new TilesRenderer(url);
		tilesRenderer.setCamera(camera);
		tilesRenderer.setResolutionFromRenderer(camera, renderer);
		scene.add(tilesRenderer.group);		


		
		let pivotPoint = vector.clone();
		let newLength = pivotPoint.length();
		pivotPoint.normalize().multiplyScalar(newLength);

		const pivot = new THREE.Object3D();
		pivot.position.set(pivotPoint.x, pivotPoint.y, pivotPoint.z);
		scene.add(pivot);
		pivot.add(camera);

		//const rotationAxis = new THREE.Vector3(3879988, 336566, 5034108).normalize();
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(normal, 0.008); // 0.01 is the rotation angle in radians


		tilesRenderer.onLoadTileSet = (tileSet) => {
			console.log('Tileset loaded', tileSet);
		};
		tilesRenderer.onLoadModel = (scene, tile) => {
			console.log('Model loaded', scene, tile);
		};


		const renderLoop = () => {

			animationFrame = requestAnimationFrame(renderLoop);
			//pivot.quaternion.multiply(quaternion);
			//camera.applyQuaternion(quaternion);
			//const newPosition = vector.clone().applyQuaternion(quaternion);
			//camera.lookAt(newPosition);

			camera.updateMatrixWorld();
			tilesRenderer.update();
			renderer.render(scene, camera);

		}
		renderLoop();

	
/*

		const loader = new GLTFLoader();
		loader.load(
			'https://storage.googleapis.com/ahp-research/maquette/models/ship_c.glb',
			//'https://storage.googleapis.com/ahp-research/maquette/models/sm_windturbine.glb',
			function (glb) {
				const group = new THREE.Object3D();
				const model = glb.scene;
				const meshesGroup = model.children; // This is an array containing all child objects of the loaded GLTF scene
    
				// Loop through the meshes group and manipulate them individually
				meshesGroup.forEach((mesh) => {
					if (mesh.children.length > 0) {
						mesh.children.forEach((child) => {
							if (child instanceof THREE.Mesh) {
								child.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
								group.add(mesh);
							}
						});
					} else {
						mesh.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
						group.add(mesh);
					}
					
				});
				//scene.add(model);
				console.log(group);
				scene.add(group);
				const boundingBox = new THREE.Box3().setFromObject(scene); // Get the bounding box of the scene
				const center = boundingBox.getCenter(new THREE.Vector3()); // Get the center of the bounding box

				camera.position.set(center.x, center.y, boundingBox.max.z * 2); // Adjust camera position based on the scene size
				camera.lookAt(center); // Make the camera look at the center of the scene
				console.log(camera);
			},
			undefined,
			function (error) {
				console.error('Error loading the GLB file', error);
			}
		);
*/
		

		
		//addCube(scene);

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
		loader.load(glbs[2], (gltf) => {
			model = gltf.scene;
			scene.add(model);
		});

		const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
		directionalLight.position.set(5, 5, 5); // Adjust the position of the light
		scene.add(directionalLight);


		camera.position.z = 115;

		const animate = function () {
			requestAnimationFrame(animate);

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

	function renderSimpleCube(): void {
		const canvas = document.getElementById('canvas');
		if (!canvas) {
			throw new Error('Canvas not found');
		}
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer({ alpha: true, canvas: canvas });
		renderer.setSize(canvas.clientWidth, canvas.clientHeight);

		//renderer.setSize(window.innerWidth, window.innerHeight);
		//document.body.appendChild(renderer.domElement);

		// Create a cube
		const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		// Set the camera position
		camera.position.z = 5;

		// Animation loop
		const animate = function () {
			requestAnimationFrame(animate);

			// Rotate the cube
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;

			renderer.render(scene, camera);
		};

		window.addEventListener('resize', function () {
			const newWidth = window.innerWidth;
			const newHeight = window.innerHeight;

			camera.aspect = newWidth / newHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(newWidth, newHeight);
		});

		// Start the animation loop
		animate();
	}
  
	// Destroy the renderer when the component is destroyed
	/*onDestroy(() => {
	  if (renderer) {
		renderer.destroy();
	  }
	});*/
  </script>
  

  <canvas id="canvas"></canvas>


  <style>

	canvas {
	  width: 100%;
	  height: 100%;
	  display: block;
	  background: linear-gradient(45deg, rgb(0, 17, 43) 5%, transparent 65%, transparent 55%, #f3f3f3 75%, #f3f3f3 100%);

	}
  </style>