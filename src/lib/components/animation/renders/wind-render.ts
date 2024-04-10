import * as THREE from 'three';
import gsap from 'gsap';
import { ThreeRenderAbstract } from './render-base';
import type { RenderHandler } from '../render-handler';


export class WindRender extends ThreeRenderAbstract {

	private windMesh!: THREE.Line;
	private direction: THREE.Vector3 = new THREE.Vector3(1, 0, 1);
	private uniforms: any = {
		u_cycle: { value: 0 }
	};

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
		this.renderer.scene.add(this.windMesh);
	}

	disposeFromScene() {
		this.renderer.scene.remove(this.windMesh);
	}

	onStepChange(progress: number) {
	}


	construct() {
		const vertexShaderSource = `
			attribute vec3 destination;
			attribute float offset;
			attribute float opacity;
			varying float vOpacity;

			uniform float u_cycle;
			varying float cycleOpacity;

			void main() {
				float cycleOffset = mod(u_cycle + offset, 1.0);
				vec3 pos = mix(position, destination, cycleOffset);

				float distanceFromCenter = length(pos.xz);
				float angle = 0.002 * distanceFromCenter; // Adjust this value to change the rotation speed
				float s = sin(angle);
				float c = cos(angle);
				mat2 rotation = mat2(c, -s, s, c);
				pos.xz = rotation * pos.xz;

				gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

				float lower = smoothstep(0.0, 0.6, cycleOffset);
				float upper = 1.0 - smoothstep(0.8, 1.0, cycleOffset);
       			cycleOpacity = clamp(min(lower, upper), 0.0, 1.0);

				vOpacity = opacity * cycleOpacity;
			}
		`;
		const fragmentShaderSource = `
			uniform float opacity;
			varying float vOpacity;

			void main() {
				gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity);

			}
		`;
		const shaderMaterial = new THREE.ShaderMaterial({
			uniforms: {
				u_cycle: this.uniforms.u_cycle
			},
			vertexShader: vertexShaderSource,
			fragmentShader: fragmentShaderSource,
			transparent: true,
			depthWrite: false,
			depthTest: true,
			blending: THREE.AdditiveBlending
		});

		const numLines= 5000;
		const fieldSize = 500;
		const travelDistance = 20;
		const direction = new THREE.Vector3(0.1, 0, -1);
		const geometry = new THREE.BufferGeometry();

		const positions = new Float32Array(numLines * 3 * 2);
		const destinations = new Float32Array(numLines * 3 * 2);
		const opacityArray = new Float32Array(numLines * 2);
		const offsetArray = new Float32Array(numLines * 2);

		for (let i = 0; i < numLines; i++) {
			let startPos = new THREE.Vector3(
				(Math.random() - 0.5) * fieldSize, 
				Math.random() * 80 + 3, 
				(Math.random() - 0.5) * fieldSize
			);
			let lineLength = Math.random() * 4 + 2;
			let endPos = startPos.clone().add(direction.clone().multiplyScalar(lineLength));
			const offset = Math.random();

			for (let j = 0; j < 2; j++) {
				offsetArray[i * 2 + j] = offset;
				opacityArray[i * 2 + j] = j % 2; 
		
				if (j % 2) {
					positions[i * 6 + j * 3] = endPos.x - direction.x * travelDistance;
					positions[i * 6 + j * 3 + 1] = endPos.y - direction.y * travelDistance;
					positions[i * 6 + j * 3 + 2] = endPos.z - direction.z * travelDistance;
		
					destinations[i * 6 + j * 3] = endPos.x + direction.x * travelDistance;
					destinations[i * 6 + j * 3 + 1] = endPos.y + direction.y * travelDistance;
					destinations[i * 6 + j * 3 + 2] = endPos.z + direction.z * travelDistance;
				} else {
					positions[i * 6 + j * 3] = startPos.x - direction.x * travelDistance;
					positions[i * 6 + j * 3 + 1] = startPos.y - direction.y * travelDistance;
					positions[i * 6 + j * 3 + 2] = startPos.z - direction.z * travelDistance;
		
					destinations[i * 6 + j * 3] = startPos.x + direction.x * travelDistance;
					destinations[i * 6 + j * 3 + 1] = startPos.y + direction.y * travelDistance;
					destinations[i * 6 + j * 3 + 2] = startPos.z + direction.z * travelDistance;
				}
			}
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('destination', new THREE.BufferAttribute(destinations, 3));
		geometry.setAttribute('opacity', new THREE.BufferAttribute(opacityArray, 1));
		geometry.setAttribute('offset', new THREE.BufferAttribute(offsetArray, 1));

		this.windMesh = new THREE.LineSegments(geometry, shaderMaterial);
		this.renderer.scene.add(this.windMesh);
	}


	render() {
		const elapsedTime = this.renderer.clock.getElapsedTime();
		this.uniforms.u_cycle.value = (elapsedTime/4) % 1;
	}
}