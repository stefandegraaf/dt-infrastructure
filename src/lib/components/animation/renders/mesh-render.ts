import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { AberrationShader } from '../shaders/aberration-shader.js';

import type { ThreeRenderComplete } from '../render-handler.js';
import { ThreeRenderAbstract } from './render-base';
import { createParticles } from '../objects/erratic-points.js';


import vertex from '../glsl/vertexParticles.glsl';

export class MeshRender extends ThreeRenderAbstract {

	private plane!: THREE.Points;
	private material!: THREE.ShaderMaterial;
	private composer!: EffectComposer;
	private bloomPass!: UnrealBloomPass;

	private particleMaterial!: THREE.ShaderMaterial;
	private particleGeometry!: THREE.BufferGeometry;

	private settings = {
		exposure: 1,
		bloomStrength: 0.9,
		bloomRadius: 0.85,
		bloomThreshold: 1.5
	};

	constructor(renderer: ThreeRenderComplete) {
		super(renderer);
		this.init();
	}

	addToScene() {
		this.renderer.scene.add(this.plane);
	}

	disposeFromScene() {
		this.renderer.scene.remove(this.plane);
	}

	show() {
		this.plane.visible = true;
	}

	hide() {
		this.plane.visible = false;
	}

	render() {
		new OrbitControls(this.renderer.camera, this.renderer.canvas);

		this.createPlane();
		return;
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
		const gltfLoader = new GLTFLoader();
		gltfLoader.setDRACOLoader(dracoLoader);
		gltfLoader.load('src/lib/files/glb/dna.glb', (gltf) => {
			//@ts-ignore
			const geometry = gltf.scene.children[0].geometry;
			geometry.center();
			//this.createPlane(geometry);
		});
	}


	createPlane() {
		this.material = new THREE.ShaderMaterial({
			extensions: {
				//derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: { value: 1.0 },
				progress: { value: 0.0 },
				resolution: { value: new THREE.Vector4() },
				uColor1: { value: new THREE.Color(0xd2fcf1) },
				uColor2: { value: new THREE.Color(0x293583) },
				uColor3: { value: new THREE.Color(0x1954ec) }, 
			},
			vertexShader: `
				uniform float time;
				uniform float progress;
				varying vec2 vUv;
				varying vec3 vPosition;
				uniform sampler2D texture;
				
				varying float vColorRandom;
				attribute float randoms;
				attribute float colorRandoms;
				attribute float offset;

				float quarticInOut(float t) {
					return t < 0.5 ? 
						+8.0 * pow(t, 4.0) : 
						-8.0 * pow(t - 1.0, 4.0) + 1.0;
				}

				void main() {
					vUv = uv;
					vColorRandom = colorRandoms;
					
					vec3 newPos = position;
					float uvOffset = uv.y;
					newPos.x += clamp((progress * (offset + 1.0) * 1.2 - 1.0), 0.0, 1.0) * 5.0 * offset;
					newPos.z -= clamp((progress * (offset + 1.0) * 1.2 - 1.0), 0.0, 1.0) * 5.0 * offset;

					newPos.y += clamp((progress * (offset + 1.0) * 1.2 - 1.0), 0.0, 1.0) * 2.0 * offset;
					//newPos.y += 3.0 * quarticInOut( clamp(0.0, 1.0, (progress - uvOffset*0.6)/0.4) );
					vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
					gl_PointSize = (10.0 * randoms + 4.0) * (1.0 / - mvPosition.z);
					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: `
				uniform float time;
				uniform float progress;
				varying float vColorRandom;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;

				uniform sampler2D textureMap;
				varying vec2 vUv;
				void main() {

					float alpha = 1.0 - smoothstep(-0.2, 0.5, length(gl_PointCoord - vec2(0.5)));
					alpha *= 0.8;
					vec3 finalColor = uColor1;
					if (vColorRandom > 0.33 && vColorRandom < 0.66) {
						finalColor = uColor2;
					} else if (vColorRandom > 0.66) {
						finalColor = uColor3;
					}

					float gradient = smoothstep(0.38, 0.55, vUv.y);

					gl_FragColor = vec4(finalColor, alpha);
				}
			
			`,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		});

		const geometry = new THREE.BufferGeometry();

		const number = 120000 //geometry.attributes.position.array.length;

		let positions = new Float32Array(number);
		let randoms = new Float32Array(number / 3);
		let colorRandoms = new Float32Array(number / 3);
		let animationOffset = new Float32Array(number / 3);

		const rows = 200;
		for (let i = 0; i < number / 3; i++) {
			randoms[i] = Math.random();
			colorRandoms[i] = Math.random();
			animationOffset[i] = Math.random();
			//animationOffset.set([Math.floor(i/rows)/600], i);

			let theta = 0.002 * Math.PI * 2 * Math.floor(i/rows);
			let radius = 0.03 * Math.floor((i%rows) - rows/2);

			let x = radius * Math.cos(theta);
			let y = 0.04 * (Math.floor(i / rows)) - 3;
			let z = radius * Math.sin(theta);
			positions.set([x, y, z], i * 3);
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1));
		geometry.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1));
		geometry.setAttribute('offset', new THREE.BufferAttribute(animationOffset, 1));

		this.plane = new THREE.Points(geometry, this.material);

		this.renderer.camera.position.set(0, -1.4, 1.5);
		this.renderer.camera.lookAt(0, 0, 0);
		//set black background
		this.renderer.renderer.setClearColor(0x000308);

		const { particles, particleGeometry, particleMaterial } = createParticles(80, 0.01, 3, 1);
		this.particleGeometry = particleGeometry;
		this.particleMaterial = particleMaterial;

		this.renderer.scene.add(particles);


		this.postProcessing();
		this.renderLoop();

	}

	postProcessing() {
		const renderScene = new RenderPass(this.renderer.scene, this.renderer.camera);
		this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.renderer.canvas.clientWidth, this.renderer.canvas.clientHeight), 5.0, 0.20, 0.01);
		const shaderPass = new ShaderPass(AberrationShader);

		this.composer = new EffectComposer(this.renderer.renderer);
		this.composer.addPass(renderScene);
		this.composer.addPass(shaderPass);
		this.composer.addPass(this.bloomPass);

	}
	

	renderLoop() {
		//this.material.uniforms.time.value = performance.now() / 1000; // time in seconds
		this.material.uniforms.progress.value = Math.abs(Math.sin(performance.now() / 6000));
		this.particleMaterial.uniforms.progress.value = Math.abs(Math.sin(performance.now() / 13000));
		
		if (this.plane) {
			this.plane.rotation.y += 0.0009;
		}
		if (this.composer && this.bloomPass) {
			//this.bloomPass.strength = this.settings.bloomStrength;
			//this.bloomPass.threshold = this.settings.bloomThreshold;
			//this.bloomPass.radius = this.settings.bloomRadius;
			this.composer.render();
		}

		//this.renderer.renderer.render(this.renderer.scene, this.renderer.camera);
	}

	
}