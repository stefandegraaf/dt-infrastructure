import * as THREE from 'three';
import gsap from 'gsap';

import type { RenderHandler } from '../render-handler';
import { ThreeRenderAbstract } from './render-base';
import { animateCamera, animateToFlightPath, gsapAddLight, gsapRemoveLight } from '../gsap-helpers';
import { get } from 'svelte/store';
import { FlightPathCenter } from '../objects/flight-path';


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
				(progress >= 11 - 0.99 && progress < 18 - 0.01)
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
		this.renderer.scene.add(this.textureMesh);
		this.renderer.scene.add(this.wireframeMesh);
	}

	disposeFromScene() {
		this.lights.forEach(light => gsapRemoveLight(this.renderer.scene, light));
		this.renderer.scene.remove(this.textureMesh);
		this.renderer.scene.remove(this.wireframeMesh);
	}

	onStepChange(step: number) {
		if (step === 0) {
			animateCamera({
				position: new THREE.Vector3(-60, 50, 100), 
				lookAt: new THREE.Vector3(-60, 0, 0), 
				camera: this.renderer.camera,
				duration: 3
			});
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 1, duration: 2 });
			gsap.to(this.uniforms.u_displacementScale, { value: 0, duration: 2 });
			this.showTexture();
		}
		// 10. Map viewer
		else if (step === 10) {
			this.flightPath.active = false;
			this.wireframeMaterial.opacity = 1;
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 0, duration: 2 });
			this.showWireframe();
		} 
		// 11. 3D Data
		else if (step === 11) {
			animateToFlightPath({
				camera: this.renderer.camera,
				flightPath: this.flightPath, 
				duration: 1.5
			});
			this.showBoth();
			this.wireframeMaterial.opacity = 0;
			gsap.to(this.wireframeMaterial, { opacity: 1, displacementScale: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 0, duration: 2 });
			gsap.to(this.uniforms.u_displacementScale, { value: 0, duration: 2 });
		} 
		// 12. 3D Terrain
		else if (step === 12) {
			animateToFlightPath({
				camera: this.renderer.camera,
				flightPath: this.flightPath, 
				duration: 1.5
			});
			this.renderer.clock.start(); //reset clock
			this.showBoth();
			gsap.to(this.wireframeMaterial, { opacity: 1, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 1, duration: 2 });
		} 
		// 13. Physical Living Environment
		if (step === 13) {
			animateToFlightPath({
				camera: this.renderer.camera,
				flightPath: this.flightPath, 
				duration: 1.5
			});
			this.showTexture();
			gsap.to(this.wireframeMaterial, { opacity: 0, displacementScale: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 1, duration: 2 });
			gsap.to(this.uniforms.u_displacementScale, { value: 0, duration: 2 });
		} 
		// 14. Real-time Insights
		else if (step === 14) {
			this.flightPath.active = false;
			animateCamera({
				position: new THREE.Vector3(154, 181, 216), 
				lookAt: new THREE.Vector3(94, 107, 187), 
				camera: this.renderer.camera,
				duration: 3
			});
			this.showTexture();
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 1, duration: 2 });
		}
		// 15. Prediction and simulation
		else if (step === 15) {
			this.flightPath.active = false;
			animateCamera({
				position: new THREE.Vector3(344, 79, 418), 
				lookAt: new THREE.Vector3(257, 44, 384), 
				camera: this.renderer.camera,
				duration: 3
			});
			this.showTexture();
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 0, duration: 2 });
		}
		// 16. Integration BIM-GIS
		else if (step === 16) {
			this.flightPath.active = false;
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 1, duration: 2 });
			this.showTexture();
		}
		// 17. Spatial Planning
		else if (step === 17) {
			animateToFlightPath({
				camera: this.renderer.camera,
				flightPath: this.flightPath, 
				duration: 1.5
			});
			this.showTexture();
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.uniforms.u_opacity, { value: 1, duration: 2 });
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
	private hideBoth(): void {
		this.textureMesh.visible = false;
		this.wireframeMesh.visible = false;
	}

	construct() {
		//this.renderer.scene.fog = new THREE.FogExp2(0x00112b, 0.004);

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
			transparent: true,
			blending: THREE.NormalBlending,
			
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
				//varying vec3 normalVecw;
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

				//vec2 uvOffset = vec2(1.0 / u_displacementMapSize.x, 1.0 / u_displacementMapSize.y);
				//float heightRight = texture2D(u_displacementMap, uv + vec2(uvOffset.x, 0.0)).r * u_displacementScale;
				//float heightUp = texture2D(u_displacementMap, uv + vec2(0.0, uvOffset.y)).r * u_displacementScale;
				//vec3 dpdx = vec3(1.0, heightRight - height, 0.0);
				//vec3 dpdy = vec3(0.0, heightUp - height, 1.0);
				//normalVecw = normalize(cross(dpdx, dpdy));
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
				//varying vec3 normalVecw;
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

				//vec3 lightDirection = normalize(vec3(0.0, 0.1, 1.0)); // Example light direction
				//float intensity = max(dot(normalVecw, lightDirection), 0.0);

				diffuseColor = vec4(color.rgb, alpha * u_opacity);
				`
			)
		};
		this.textureMesh = new THREE.Mesh(geometry, this.textureMaterial);
		this.textureMesh.renderOrder = 1;
		this.textureMesh.receiveShadow = true;
		this.textureMesh.castShadow = true;

		this.wireframeMaterial = new THREE.MeshStandardMaterial({
			color: 0x00e1ff,
			side: THREE.DoubleSide,
			displacementMap: this.uniforms.u_displacementMap.value,
			displacementScale: this.uniforms.u_displacementScale.value,
			alphaMap: this.uniforms.u_alphaMap.value,
			transparent: true,
			wireframe: true,
			depthTest: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		});
		this.wireframeMesh = new THREE.Mesh(geometry, this.wireframeMaterial);
		this.wireframeMesh.position.y += 0.1;
		//this.wireframeMesh.receiveShadow = true;
		//this.wireframeMesh.castShadow = true;
		
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
		directionalLight.position.set(0, 450, 375);
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
		if (step < 14 || step === 17) this.flightPath.updateCamera(this.renderer.camera);
		if (step === 12) {
			const t = Math.abs(Math.sin(this.renderer.clock.getElapsedTime() / 5));
			const displacement = t * 55;
			const t_opacity = Math.min(1, t * t * 1.2);

			this.uniforms.u_displacementScale.value = displacement;
			this.uniforms.u_opacity.value = t_opacity;

			this.wireframeMaterial.displacementScale = displacement;
			this.wireframeMaterial.opacity = (1 - t_opacity);
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

