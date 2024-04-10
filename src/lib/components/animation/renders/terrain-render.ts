import * as THREE from 'three';
import gsap from 'gsap';

import type { RenderHandler } from '../render-handler';
import { ThreeRenderAbstract } from './render-base';
import { animateCamera, gsapAddLight, gsapRemoveLight } from '../gsap-helpers';
import { get } from 'svelte/store';


export class TerrainRender extends ThreeRenderAbstract {

	private textureMesh!: THREE.Mesh;
	private textureMaterial!: THREE.MeshStandardMaterial;
	private wireframeMesh!: THREE.Mesh;
	private wireframeMaterial!: THREE.MeshStandardMaterial;

	private uniforms: any = {
		u_texture1: { value: null },
		u_texture2: { value: null },
		u_displacementMap: { value: null },
		u_alphaMap: { value: null },
		u_normalMap: { value: null },
		u_opacity: { value: 1.0 },
		u_displacementScale: { value: 0.1 },
		u_height: { value: 0.5 }
	};

	private lights!: THREE.Light[];
	private lightIntensities!: number[];
	private flightPath!: FlightPathCenter;
	
	constructor(renderer: RenderHandler, start: number, end: number) {
		super(renderer, start, end);
		this.construct();
		this.renderer.progressWritable.subscribe((progress) => {
			if (
				(progress >= this.start - 0.99 && progress < this.end - 0.01) ||
				(progress >= 11 - 0.99 && progress < 17 - 0.01)
			) {			
				if (!this.added) this.add();
			} else {
				if (this.added) this.dispose();
			}
		});
		this.renderer.selectedIndex.subscribe((step) => {
			this.onStepChange(step);
		});
	}

	addToScene() {
		this.lights.forEach((light, i) => gsapAddLight(this.renderer.scene, light, this.lightIntensities[i]));
		//this.renderer.scene.add(this.textureMesh);
		//this.renderer.scene.add(this.wireframeMesh);
		this.renderer.pivot.add(this.textureMesh);
		this.renderer.pivot.add(this.wireframeMesh);
	}

	disposeFromScene() {
		this.lights.forEach(light => gsapRemoveLight(this.renderer.scene, light));
		//this.renderer.scene.remove(this.textureMesh);
		//this.renderer.scene.remove(this.wireframeMesh);
		this.renderer.pivot.remove(this.textureMesh);
		this.renderer.pivot.remove(this.wireframeMesh);
	}

	onStepChange(step: number) {
		// 10. Map viewer
		if (step === 0) {
			animateCamera({
				position: new THREE.Vector3(-60, 50, 100), 
				lookAt: new THREE.Vector3(-60, 0, 0), 
				camera: this.renderer.camera,
				duration: 3
			});
			gsap.to(this.wireframeMaterial, { opacity: 1, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 0, duration: 2 });
			this.showWireframe();
		}
		else if (step === 10) {
			this.wireframeMaterial.opacity = 1;
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 0, duration: 2 });
			this.showWireframe();
		} 
		// 11. 3D Data
		else if (step === 11) {
			this.showBoth();
			animateCamera({
				position: new THREE.Vector3(0, 50, 80), 
				lookAt: new THREE.Vector3(-10, 5, 40), 
				camera: this.renderer.camera,
				duration: 3
			});
			this.wireframeMaterial.opacity = 0;
			gsap.to(this.wireframeMaterial, { opacity: 1, displacementScale: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 0, duration: 2 });
			gsap.to(this.uniforms.u_displacementScale, { value: 0, duration: 2 });
		} 
		// 12. 3D Terrain
		else if (step === 12) {
			this.renderer.clock.start(); //reset clock
			this.showBoth();
			animateCamera({
				position: new THREE.Vector3(-60, 120, 120), 
				lookAt: new THREE.Vector3(-100, 0, 0), 
				camera: this.renderer.camera,
				duration: 3,
			});
			gsap.to(this.wireframeMaterial, { opacity: 1, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 1, duration: 2 });
		} 
		// 13. Physical Living Environmen
		if (step === 13) {
			this.showTexture();
			animateCamera({
				position: new THREE.Vector3(-60, 50, 100), 
				lookAt: new THREE.Vector3(-60, 0, 0), 
				camera: this.renderer.camera,
				duration: 3
			});
			gsap.to(this.wireframeMaterial, { opacity: 0, displacementScale: 0, duration: 1 });
			gsap.to(this.uniforms.u_displacementScale, { value: 0, duration: 2 });
		} 
		// 14. Real-time Insights
		else if (step === 14) {
			animateCamera({
				position: new THREE.Vector3(-60, 50, 100), 
				lookAt: new THREE.Vector3(-60, 0, 0), 
				camera: this.renderer.camera,
				duration: 3
			});
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 1, duration: 2 });
		}
		// 15. Prediction and simulation
		else if (step === 15) {
			animateCamera({
				position: new THREE.Vector3(-300, 100, -350), 
				lookAt: new THREE.Vector3(-220, 50, -330), 
				camera: this.renderer.camera,
				duration: 3
			});
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 0, duration: 2 });
		}
	}

	private showWireframe(): void {
		this.textureMesh.visible = false;
		this.wireframeMesh.visible = true;
	}
	private showTexture(): void {
		this.textureMesh.visible = true;
		this.wireframeMesh.visible = false;
	}
	private showBoth(): void {
		this.textureMesh.visible = true;
		this.wireframeMesh.visible = true;
	}

	construct() {
		const geometry = new THREE.PlaneGeometry(750, 750, 250, 250);
		geometry.rotateX(-Math.PI / 2);
		const loader = new THREE.TextureLoader();
		this.uniforms.u_texture1.value = loader.load('https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/basemap-texture.png');
		this.uniforms.u_texture2.value = loader.load('https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/mountain-texture.jpg');
		this.uniforms.u_displacementMap.value = loader.load('https://blenderartists.org/uploads/default/original/4X/5/0/5/505f9cafccb6e5c00bba9da7be24478b69186cb4.jpeg');
		this.uniforms.u_alphaMap.value = loader.load('https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/alpha-map-round.jpg');

		this.uniforms.u_normalMap.value = loader.load('https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/istockphoto-1396946488-612x612.jpg');

		/*const XtextureMaterial = new THREE.MeshStandardMaterial({ 
			color: 0x00e1ff,
			side: THREE.DoubleSide,
			map: textureMountain,
			displacementMap: displacementMap,
			displacementScale: displacementScale.value,
			alphaMap: alphaMap,
			transparent: true,
			opacity: 0.5,
			depthTest: true
		});*/

		//const normalMap = loader.load('https://storage.googleapis.com/ahp-research/projects/communicatie/three-js/texture-maps/istockphoto-1396946488-612x612.jpg');
/*
		this.textureMaterial = new THREE.ShaderMaterial({
			uniforms: {
				texture1: { value: textureLowland },
				texture2: { value: textureMountain },
				displacementMap: { value: displacementMap },
				alphaMap: { value: alphaMap },
				normalMap: { value: normalMap },
				u_opacity: { value: 1.0 },
				displacementScale: { value: displacementScale.value },
				height: { value: 0.5 } // Adjust this value to control the height at which the textures are mixed
			},
			vertexShader: `
				varying vec2 vUv;
				varying float height;
				uniform float displacementScale;
				uniform sampler2D displacementMap;
				void main() {
					vUv = uv;
					vec4 displacement = texture2D(displacementMap, uv);
					height = displacement.r * displacementScale;
					vec3 newPos = position;
					newPos.y += height;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
				}
			`,
			fragmentShader: `
				varying vec2 vUv;
				varying float height;
				uniform sampler2D texture1;
				uniform sampler2D texture2;
				uniform sampler2D alphaMap;
				uniform sampler2D normalMap;
				uniform float u_opacity;

				void main() {
					vec4 color1 = texture2D(texture1, vUv);
					vec4 color2 = texture2D(texture2, vUv);
					float alpha = texture2D(alphaMap, vUv).r;
					float mixFactor = smoothstep(1.0, 3.9, height);
					vec4 color = mix(color1, color2, mixFactor);

					vec3 normal = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
      				normal.y = -normal.y; // Invert Y axis if needed
					vec3 lightDirection = normalize(vec3(0.0, 1.0, 1.0)); // Example light direction
					float intensity = max(dot(normal, lightDirection), 0.0);
				  

					gl_FragColor = vec4(color.rgb , alpha * u_opacity);
				}
			`,
			transparent: true,
			depthTest: true,
			//side: THREE.DoubleSide
		});
		this.textureMesh = new THREE.Mesh(geometry, this.textureMaterial);
*/		

		this.textureMaterial = new THREE.MeshStandardMaterial({
			transparent: true
			/*
			map: textureLowland,
			displacementMap: displacementMap,
			displacementScale: displacementScale.value,
			alphaMap: alphaMap,
			normalMap: normalMap,
			opacity: 1.0,
			
			depthTest: true,
			side: THREE.DoubleSide*/
		});

		this.textureMaterial.onBeforeCompile = (shader) => {
			
			Object.assign(shader.uniforms, this.uniforms);
			
			shader.vertexShader = shader.vertexShader.replace(
				"#include <common>",
				`
				#include <common>
				varying vec2 vUv;
				varying float height;
				uniform float u_displacementScale;
				uniform sampler2D u_displacementMap;
				`
			),
			shader.vertexShader = shader.vertexShader.replace(
				"#include <begin_vertex>",
				`
				#include <begin_vertex>
				vUv = uv;
				vec4 displacement = texture2D(u_displacementMap, uv);
				height = displacement.r * u_displacementScale;
				transformed.y += height;
				`
			),
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <common>",
				`
				#include <common>
				varying vec2 vUv;
				varying float height;
				uniform sampler2D u_texture1;
				uniform sampler2D u_texture2;
				uniform sampler2D u_alphaMap;
				uniform sampler2D u_normalMap;
				uniform float u_opacity;
				`
			),
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <color_fragment>",
				`
				#include <color_fragment>
				vec4 color1 = texture2D(u_texture1, vUv);
				vec4 color2 = texture2D(u_texture2, vUv);
				float alpha = texture2D(u_alphaMap, vUv).r;
				float mixFactor = smoothstep(1.0, 3.9, height);
				vec4 color = mix(color1, color2, mixFactor);

				//vec3 normal = texture2D(u_normalMap, vUv).xyz * 2.0 - 1.0;
				//normal.y = -normal.y; // Invert Y axis if needed
				//vec3 lightDirection = normalize(vec3(0.0, 1.0, 1.0)); // Example light direction
				//float intensity = max(dot(normal, lightDirection), 0.0);

				diffuseColor = vec4(color.rgb , alpha * u_opacity);
				`
			)
		};
		this.textureMesh = new THREE.Mesh(geometry, this.textureMaterial);
		this.textureMesh.receiveShadow = true
		this.renderer.scene.add(this.textureMesh);

		this.wireframeMaterial = new THREE.MeshStandardMaterial({
			color: 0x00e1ff,
			side: THREE.DoubleSide,
			displacementMap: this.uniforms.u_displacementMap.value,
			displacementScale: this.uniforms.u_displacementScale.value,
			alphaMap: this.uniforms.u_alphaMap.value,
			transparent: true,
			wireframe: true,
			depthTest: true
		});
		this.wireframeMesh = new THREE.Mesh(geometry, this.wireframeMaterial);
		this.wireframeMesh.position.y += 0.1;
		
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
		directionalLight.position.set(0, 450, 375); // set the direction of the light
		directionalLight.target.position.set(0, 0, 0);
		directionalLight.castShadow = true;
		directionalLight.shadow.bias = -0.001;
		directionalLight.shadow.mapSize.width = 4096;
		directionalLight.shadow.mapSize.height = 4096;

		const v = 650;
		directionalLight.shadow.camera.near = 0.5;
		directionalLight.shadow.camera.far = 800;
		directionalLight.shadow.camera.left = -v;
		directionalLight.shadow.camera.right = v;
		directionalLight.shadow.camera.top = v;
		directionalLight.shadow.camera.bottom = -v;
		directionalLight.shadow.camera.updateProjectionMatrix();

		this.renderer.scene.add(directionalLight);

		this.lights = [ambientLight, directionalLight];
		this.lightIntensities = [ambientLight.intensity, directionalLight.intensity];


		this.flightPath = new FlightPathCenter(
			[
				new THREE.Vector3(-80, 60, 100),
				new THREE.Vector3(40, 40, 80),
				new THREE.Vector3(40, 50, -100),
				new THREE.Vector3(-80, 60, -80),
				new THREE.Vector3(-80, 60, 100),
			], 
			0.00004
		);
		
	}

	render() {
		//rotateCameraY(this.renderer.camera, 0.002);
		//rotateCameraAndLookAt(this.renderer.camera, 0.2, 30, 90);
		//this.renderer.camera.lookAt(new THREE.Vector3(0, 0, 0));
		//this.renderer.camera.rotation.y += 0.13;

		//const quaternion = new THREE.Quaternion();
		//quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.01); // Rotate around Y-axis
		//this.renderer.pivot.quaternion.multiply(quaternion);

		//this.renderer.pivot.rotation.y += 0.001;

		const step = get(this.renderer.selectedIndex);
		if (step < 15) this.flightPath.updateCamera(this.renderer.camera);
		if (step === 12) {
			const t = Math.abs(Math.sin(this.renderer.clock.getElapsedTime() / 5));
			const displacement = t * 40;

			this.uniforms.u_displacementScale.value = displacement;
			this.uniforms.u_opacity.value = t * t;

			this.wireframeMaterial.displacementScale = displacement;
			this.wireframeMaterial.opacity = (1 - t * t);
		}
	}
}


function rotateCameraY(camera: THREE.PerspectiveCamera, angle: number) {
	let target = new THREE.Vector3(0, 0, 0);
	let newPosition = new THREE.Vector3().subVectors(camera.position, target);
	newPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
	newPosition.add(target);

	// Update the position and orientation of the camera
	camera.position.copy(newPosition);
	const lookat = getLookAt(camera);
	camera.lookAt(lookat);
}

function getLookAt(camera: THREE.PerspectiveCamera): THREE.Vector3 {
	const point = camera.position.clone().normalize();
	const angleInRadians = THREE.MathUtils.degToRad(90);
	const previousX = point.x * Math.cos(angleInRadians) + point.z * Math.sin(angleInRadians);
	const previousZ = -point.x * Math.sin(angleInRadians) + point.z * Math.cos(angleInRadians);
	return new THREE.Vector3(previousX, 0, previousZ).multiplyScalar(-50);
}





class FlightPath {

    private curve: THREE.CatmullRomCurve3;
    private time: number;
	private deltaTime: number;
    private speed: number;

    constructor(points: Array<THREE.Vector3>, speed: number) {
        this.curve = new THREE.CatmullRomCurve3(points);
        this.time = performance.now();
		this.deltaTime = 0;
        this.speed = speed ?? 0.0001;
    }

   // public getPoint(): THREE.Vector3 {
    //    return this.curve.getPoint(this.time % 1);
    //}

    public getTangent(): THREE.Vector3 {
        return this.curve.getTangent(this.deltaTime % 1);
    }

    public updateCamera(camera: THREE.PerspectiveCamera): void {
		let currentTime = performance.now();
		let deltaTime = (currentTime - this.time);
        this.time = currentTime; // Update the time to the current time
    	this.deltaTime += deltaTime * this.speed 
        const position = this.curve.getPoint(this.deltaTime % 1);
        camera.position.copy(position);
        const lookAt = position.clone().add(this.getTangent());
        camera.lookAt(lookAt);
    }
}

class FlightPathCenter {

    private curve: THREE.CatmullRomCurve3;
    private time: number;
	private deltaTime: number;
    private speed: number;

    constructor(points: Array<THREE.Vector3>, speed: number) {
        this.curve = new THREE.CatmullRomCurve3(points);
        this.time = performance.now();
		this.deltaTime = 0;
        this.speed = speed ?? 0.0001;
    }

   // public getPoint(): THREE.Vector3 {
    //    return this.curve.getPoint(this.time % 1);
    //}

    public getTangent(): THREE.Vector3 {
        return this.curve.getTangent(this.deltaTime % 1);
    }

    public updateCamera(camera: THREE.PerspectiveCamera): void {
		let currentTime = performance.now();
		let deltaTime = (currentTime - this.time);
        this.time = currentTime; // Update the time to the current time
    	this.deltaTime += deltaTime * this.speed 
        const position = this.curve.getPoint(this.deltaTime % 1);
        camera.position.copy(position);
        //const lookAt = position.clone().add(this.getTangent());
        camera.lookAt(0, 2, 0);
    }
}

