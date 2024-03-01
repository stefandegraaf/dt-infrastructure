import * as THREE from 'three';
import gsap from 'gsap';

import type { RenderHandler } from '../render-handler';
import { ThreeRenderAbstract } from './render-base';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export class DataCore extends ThreeRenderAbstract {

	private instancedMesh!: THREE.InstancedMesh;
	private uniforms!: any;
	private material!: THREE.MeshPhysicalMaterial;
	
	private fbo!: THREE.WebGLRenderTarget;
	private fboScene!: THREE.Scene;
	private fboCamera!: THREE.OrthographicCamera;

	private ambientLight!: THREE.AmbientLight;
	private spotLight!: THREE.SpotLight;

	constructor(renderer: RenderHandler, start: number, end: number) {
		super(renderer, start, end);
		this.construct();
		this.renderer.progressWritable.subscribe((progress) => {
			if (progress >= this.start - 0.99 && progress < this.end - 0.01) {
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
		/* DIRTY GLB LOAD FIX */
		if (!this.instancedMesh){ setTimeout(() => this.addToScene(), 10); return; }
		/* DIRTY GLB LOAD FIX */
		this.renderer.scene.add(this.instancedMesh);
		this.renderer.scene.add(this.ambientLight);
		this.renderer.scene.add(this.spotLight);
		this.renderer.scene.add(this.spotLight.target);
	}

	disposeFromScene() {
		this.renderer.scene.remove(this.instancedMesh);
		this.renderer.scene.remove(this.ambientLight);
		this.renderer.scene.remove(this.spotLight);
		this.renderer.scene.remove(this.spotLight.target);
	}

	onStepChange(progress: number) {
		if (progress === 5) {
			gsap.to(this.renderer.camera.position, {
				x: -35,
				y: 40,
				z: 50,
				duration: 2,
				ease: "power2.out",
				onUpdate: () => {
					this.renderer.camera.lookAt(-35, 0, 30);
				}
			});
		} else if (progress > 9 && progress < 9.2) {
			this.renderer.clock.oldTime -= this.renderer.clock.getElapsedTime() * 1000;
		}
	}

	show() {
		this.instancedMesh.visible = true;
	}

	hide() {
		this.instancedMesh.visible = false;
	}

	construct() {		
		const textureLoader = new THREE.TextureLoader();
		const aoTexture = textureLoader.load("src/lib/files/textures/cube-ambient-occlusion-texture.png");
		aoTexture.flipY = false;

		this.uniforms = {
			cluster: { value: 0 },
			u_cycle: { value: 0 },
			u_progress: { value: 0 },
			uFBO: { value: null },
			aoMap: { value: aoTexture },
			light_color: { value: new THREE.Color(0xffe9e9) },
			ramp_color_one: { value: new THREE.Color(0x06082D) },
			ramp_color_two: { value: new THREE.Color(0x020284) },
			ramp_color_three: { value: new THREE.Color(0x0000ff) },
			ramp_color_four: { value: new THREE.Color(0x71c7f5) }
		};

		const fboTextureSquare = textureLoader.load("src/lib/files/textures/fbo-square.png");
		fboTextureSquare.flipY = false;
		const fboTextureEurope = textureLoader.load("src/lib/files/textures/fbo-europe.png");
		//fboTextureEurope.flipY = false;

		this.fbo = new THREE.WebGLRenderTarget(this.renderer.canvas.clientWidth, this.renderer.canvas.clientHeight);
		this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
		this.fboScene = new THREE.Scene();
		const fboMaterial = new THREE.ShaderMaterial({
			uniforms: {
				u_progress: this.uniforms.u_progress,
				u_cycle: this.uniforms.u_cycle,
				uState1: { value: fboTextureSquare },
				uState2: { value: fboTextureEurope },
				uFBO: { value: null }
			},
			vertexShader: `
				uniform float u_progress;
				varying vec2 vUv;
				varying float vAnimationProgress;
				void main() {
					vUv = uv;
					vAnimationProgress = u_progress - 9.0;

					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float u_progress;
				uniform sampler2D uState1;
				uniform sampler2D uState2;
				varying vec2 vUv;
				varying float vAnimationProgress;
				void main() {
					//vec4 color1 = texture2D(uState1, vUv);
					if (u_progress > 9.0) {
						vec4 color2 = vec4(1.0, 1.0, 1.0, 0.0) - texture2D(uState2, vUv);
						if (u_progress > 10.0) {
							color2 *= (1.0 - smoothstep(10.0, 11.0, u_progress));
						}

						float dist = distance(vUv, vec2(0.5));
						float radius = 1.8;
						//float outer_progress = clamp(1.1*u_cycle, 0.0, 1.0);
						//float inner_progress = clamp(1.1*u_cycle - 0.05, 0.0, 1.0);
						float outer_progress = smoothstep(0.0, 1.0, 1.1*vAnimationProgress);
						float inner_progress = smoothstep(0.0, 1.0, 1.1*vAnimationProgress - 0.05);
					
						float innerCircle = 1.0 - smoothstep((inner_progress-0.1)*radius, inner_progress*radius, dist);
						float outerCircle = 1.0 - smoothstep((outer_progress-0.1)*radius, outer_progress*radius, dist);

						float displacement = outerCircle - innerCircle;
						float scale = mix(1.0, color2.r, innerCircle);

						gl_FragColor = vec4(vec3(displacement, scale, scale), 1.0);
					} else {
						gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
					}
				}
			`
		});
		const fboGeometry = new THREE.PlaneGeometry(2, 2);
		const fboMesh = new THREE.Mesh(fboGeometry, fboMaterial);		
		this.fboScene.add(fboMesh);
		//this.renderer.scene.add(fboMesh);
		this.uniforms.uFBO.value = this.fbo.texture;

		
		this.material = new THREE.MeshPhysicalMaterial({
			roughness: 0.65,
			map: aoTexture,
			aoMap: aoTexture,
			aoMapIntensity: 0.75
		});
		this.material.onBeforeCompile = (shader) => {
			shader.uniforms = Object.assign(shader.uniforms, this.uniforms);
			shader.vertexShader = shader.vertexShader.replace(
				"#include <common>",
				`
				#include <common>

				uniform sampler2D uFBO;
				uniform float u_progress;
				attribute vec2 instanceUV;
				attribute float stepNumber;
				varying float vStepNumber;
				varying float vHeight;
				varying float vHeightUV;
				${noise}
				`
			);
			shader.vertexShader = shader.vertexShader.replace(
				"#include <begin_vertex>",
				`
				#include <begin_vertex>

				vStepNumber = stepNumber;
				
				if (vStepNumber < u_progress) {
					if (transformed.y > 0.0) {
						transformed.y += 2.0 * clamp(u_progress - vStepNumber, 0.0, 1.0);
					}
				} 

				//float n = cnoise(vec3(instanceUV.x*5.0, instanceUV.y*5.0, u_cycle*5.0));
				//transformed.y += n*0.25;
				//transformed.y += 0.4 * sin(3.14159 * (u_cycle * 5.0 - instanceUV.x * 13.0));
				
				vec4 transition = texture2D(uFBO, instanceUV);
				transformed *= transition.g;
				transformed.y += transition.r*8.0;
				
				vHeight = transformed.y;
				
				`
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <common>",
				`
				#include <common>
				uniform vec3 light_color;
				uniform vec3 ramp_color_one;
				uniform vec3 ramp_color_two;
				uniform vec3 ramp_color_three;
				uniform vec3 ramp_color_four;
				varying float vHeight;
				varying float vHeightUV;
				varying float vStepNumber;
				`
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <color_fragment>",
				`
				#include <color_fragment>

				vec3 highlight = mix(ramp_color_three, ramp_color_four, vHeightUV);
				diffuseColor.rgb = ramp_color_two;
				diffuseColor.rgb = mix(diffuseColor.rgb, ramp_color_three, vHeight);
				diffuseColor.rgb = mix(diffuseColor.rgb, highlight, clamp(vHeight/10.0 - 3.0, 0.0, 1.0));
				//diffuseColor.rgb = mix(diffuseColor.rgb, light_color, vStepNumber);
				`		
			);
		}


		const loader = new GLTFLoader();
		loader.load("src/lib/files/glb/bar.glb", (gltf) => {
			const model = gltf.scene.children[0] as THREE.Mesh;
			const geometry = model.geometry;

			const size = 50;
			const instances = size**2;
			this.instancedMesh = new THREE.InstancedMesh(geometry, this.material, instances);
			let dummy = new THREE.Object3D();
			let width = 1.6;
			let stepNumber = new Float32Array(instances);
			let instanceUV = new Float32Array(instances * 2);
			for (let i=0; i<size; i++) {
				for (let j=0; j<size; j++) {
					instanceUV[(i*size+j)*2] = i/size;
					instanceUV[(i*size+j)*2+1] = j/size;
					dummy.position.set(
						(i-size/2)*width,
						0,
						-(j-size/2)*width
					);
					dummy.updateMatrix();
					this.instancedMesh.setMatrixAt(i*size+j, dummy.matrix);
					stepNumber[i*size+j] = getStepNumber(j/size) + this.start - 1;
				}
			}
			geometry.setAttribute("instanceUV", new THREE.InstancedBufferAttribute(instanceUV, 2));
			geometry.setAttribute("stepNumber", new THREE.InstancedBufferAttribute(stepNumber, 1));

		});

		function getStepNumber(y: number) {
			return Math.floor(y * 5);
		}
		

		this.ambientLight = new THREE.AmbientLight(0xffffff, 1);

		this.spotLight = new THREE.SpotLight(0xffffff, 200);
		this.spotLight.position.set(10, 15, -15);
		this.spotLight.target.position.set(-50, 0, 20);
		this.spotLight.penumbra = 1.5;
		this.spotLight.distance = 400;
		this.spotLight.decay = 1.0;

		/*
		let tl = gsap.timeline({
			repeat: -1, // repeat indefinitely
			yoyo: true // reverse the animation on each alternate repeat
		});
		
		// Add a tween to the timeline
		tl.to(this.uniforms.uProgress, {
			value: 1, // end value
			duration: 3000, // duration in seconds
			ease: "none", // linear interpolation
			onUpdate: () => {
				//this.material.uniforms.uProgress.value = this.uniforms.progress.value;
				this.uniforms.needsUpdate = true;
			}
		});		this.renderer.scene.add(fboMesh);
		*/
	}

	render() {

		this.uniforms.u_progress.value = this.renderer.progress.value;
		const elapsedTime = this.renderer.clock.getElapsedTime();
		this.uniforms.u_cycle.value = Math.abs(Math.sin(elapsedTime / 3));
		
		this.renderer.renderer.setRenderTarget(this.fbo);
		this.renderer.renderer.render(this.fboScene, this.fboCamera);
		this.renderer.renderer.setRenderTarget(null);


	}
}



const noise = `
//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}
`