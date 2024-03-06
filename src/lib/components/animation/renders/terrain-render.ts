import * as THREE from 'three';
import gsap from 'gsap';

import type { RenderHandler } from '../render-handler';
import { ThreeRenderAbstract } from './render-base';
import { animateCamera, gsapAddLight, gsapRemoveLight } from '../gsap-helpers';
import { get } from 'svelte/store';


export class TerrainRender extends ThreeRenderAbstract {

	private textureMesh!: THREE.Mesh;
	private textureMaterial!: THREE.ShaderMaterial;
	private wireframeMesh!: THREE.Mesh;
	private wireframeMaterial!: THREE.MeshStandardMaterial;

	private lights!: THREE.Light[];
	
	constructor(renderer: RenderHandler, start: number, end: number) {
		super(renderer, start, end);
		this.construct();
		this.renderer.progressWritable.subscribe((progress) => {
			if (
				(progress >= this.start - 0.99 && progress < this.end - 0.01) ||
				(progress >= 11 - 0.99 && progress < 14 - 0.01)
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
		this.lights.forEach(light => gsapAddLight(this.renderer.scene, light, 1));
		this.renderer.pivot.add(this.textureMesh);
		this.renderer.pivot.add(this.wireframeMesh);
	}

	disposeFromScene() {
		this.lights.forEach(light => gsapRemoveLight(this.renderer.scene, light));
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
			this.showWireframe();
		}
		else if (step === 10) {
			this.wireframeMaterial.opacity = 1;
			gsap.to(this.wireframeMaterial, { opacity: 0, duration: 1 });
			gsap.to(this.textureMaterial.uniforms.u_opacity, { value: 0, duration: 2 });
			this.showWireframe();
		} 
		// 11. 3D Data
		else if (step === 11) {
			this.showBoth();
			animateCamera({
				position: new THREE.Vector3(-60, 50, 100), 
				lookAt: new THREE.Vector3(-60, 0, 0), 
				camera: this.renderer.camera,
				duration: 3
			});
			this.wireframeMaterial.opacity = 0;
			gsap.to(this.wireframeMaterial, { opacity: 1, displacementScale: 0, duration: 1 });
			gsap.to(this.textureMaterial.uniforms.u_opacity, { value: 0, duration: 2 });
			gsap.to(this.textureMaterial.uniforms.displacementScale, { value: 0, duration: 2 });
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
			gsap.to(this.textureMaterial.uniforms.u_opacity, { value: 1, duration: 2 });
		} 
		// 13. Physical Living Environment
		if (step === 13) {
			this.showTexture();
			animateCamera({
				position: new THREE.Vector3(-60, 50, 100), 
				lookAt: new THREE.Vector3(-60, 0, 0), 
				camera: this.renderer.camera,
				duration: 3
			});
			gsap.to(this.wireframeMaterial, { opacity: 0, displacementScale: 0, duration: 1 });
			gsap.to(this.textureMaterial.uniforms.u_opacity, { value: 1, duration: 2 });
			gsap.to(this.textureMaterial.uniforms.displacementScale, { value: 0, duration: 2 });
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
			gsap.to(this.textureMaterial.uniforms.u_opacity, { value: 0, duration: 2 });
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
		const geometry = new THREE.PlaneGeometry(250, 250, 100, 100);
		geometry.rotateX(-Math.PI / 2);
		const loader = new THREE.TextureLoader();
		const textureMountain = loader.load('src/lib/files-gitignore/textures/mountain-texture.jpg');
		const textureLowland = loader.load('src/lib/files-gitignore/textures/grass-texture.jpg');
		const displacementMap = loader.load('https://blenderartists.org/uploads/default/original/4X/5/0/5/505f9cafccb6e5c00bba9da7be24478b69186cb4.jpeg');
		const alphaMap = loader.load('src/lib/files/textures/alpha-map-round.jpg');

		const displacementScale = { value: 0.1 };
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

		const normalMap = loader.load('src/lib/files-gitignore/textures/istockphoto-1396946488-612x612.jpg');

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
				  

					gl_FragColor = vec4(color.rgb * intensity , alpha * u_opacity);
				}
			`,
			transparent: true,
			depthTest: true,
			//side: THREE.DoubleSide
		});
		this.textureMesh = new THREE.Mesh(geometry, this.textureMaterial);

		this.wireframeMaterial = new THREE.MeshStandardMaterial({
			color: 0x00e1ff,
			side: THREE.DoubleSide,
			displacementMap: displacementMap,
			displacementScale: displacementScale.value,
			alphaMap: alphaMap,
			transparent: true,
			wireframe: true,
			depthTest: true
		});
		this.wireframeMesh = new THREE.Mesh(geometry, this.wireframeMaterial);
		this.wireframeMesh.position.y += 0.1;
		
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
		directionalLight.position.set(1, 1, 1); // set the direction of the light
		this.lights = [ambientLight, directionalLight];
		
	}

	render() {
		//this.renderer.pivot.rotation.y += 0.0024;
		const step = get(this.renderer.selectedIndex);
		
		if (step === 12) {
			const t = Math.abs(Math.sin(this.renderer.clock.getElapsedTime() / 5));
			const displacement = t * 40;

			this.textureMaterial.uniforms.displacementScale.value = displacement;
			this.textureMaterial.uniforms.u_opacity.value = t * t;

			this.wireframeMaterial.displacementScale = displacement;
			this.wireframeMaterial.opacity = (1 - t * t);
		}
	}
}