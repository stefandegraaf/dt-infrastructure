
import * as THREE from 'three';


export function earthWireFrame(size: number): { mesh: THREE.LineSegments, material: THREE.ShaderMaterial } {
	const wireframeShaderMaterial = new THREE.ShaderMaterial({
		uniforms: {
			u_time: { value: 0 },
			u_opacity: { value: 0.0 }
		},
		vertexShader: `
			varying float vIntensity;
			attribute float intensity;
			uniform float u_time;
			uniform float u_opacity;

			void main() {
				//vIntensity = intensity;
				vIntensity = sin(position.y * 10.0 + u_time) * u_opacity;
				//vIntensity = vIntensity - clamp(sin(position.x * 10.0 + u_time), 0.0, 1.0);
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,

		fragmentShader: `
			varying float vIntensity;
			void main() {
				//gl_FragColor = vec4(vec3(vIntensity), 1.0);
				vec3 color = vec3(0.0, 1.0, 1.0); // neon blue color
				gl_FragColor = vec4(color * (vIntensity * 1.0 + 0.5), vIntensity); // Use vIntensity to set the color
			}
		`,
		transparent: true
	
	});

	const noiseAmount = size / 24;
	const sphereGeometry = new THREE.SphereGeometry(size + noiseAmount, 32, 32);
	for (let i = 0; i < sphereGeometry.attributes.position.array.length; i++) {
		const noise = Math.random() * noiseAmount*2 - noiseAmount;
		sphereGeometry.attributes.position.array[i] += noise;
	}
	sphereGeometry.attributes.position.needsUpdate = true; // This line is important, it tells Three.js to update the geometry with the new positions
	const wireframeGeometry = new THREE.WireframeGeometry(sphereGeometry);


	const intensities = new Float32Array(wireframeGeometry.attributes.position.count);
	for (let i = 0; i < wireframeGeometry.attributes.position.count; i++) {
		intensities[i] = Math.random();
	}
	wireframeGeometry.setAttribute('intensity', new THREE.BufferAttribute(intensities, 1));

	const wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeShaderMaterial);

	return { mesh: wireframeMesh, material: wireframeShaderMaterial };
}


export function earthDots(size: number, numberOfDots: number): {points: THREE.Points, material: THREE.ShaderMaterial} {
	const dotsGeometry = new THREE.BufferGeometry();
	const positions = new Float32Array(numberOfDots * 3);
	const sizes = new Float32Array(numberOfDots);

	for (let i = 0; i < numberOfDots; i++) {
		const globeSize = size + 0.1;
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(1 - 2 * Math.random());
		positions[i * 3] = globeSize * Math.sin(phi) * Math.cos(theta);
		positions[i * 3 + 1] = globeSize * Math.sin(phi) * Math.sin(theta);
		positions[i * 3 + 2] = globeSize * Math.cos(phi);
		sizes[i] = Math.random() * 0.02 + 0.02;
	}
	dotsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	dotsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
	


	const dotsMaterial = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: 0 },
			color: { value: new THREE.Color(0x00e1ff) },
			u_opacity: { value: 0.0 }
		},
		vertexShader: `
			uniform float time;
			uniform vec3 color;

			attribute float size;
			varying vec3 vColor;
			void main() {
				vColor = color;
				vec3 pos = position;
				vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
				gl_PointSize = size * (300.0 / -mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
			}
		`,
		fragmentShader: `
			uniform vec3 color;
			varying vec3 vColor;
			uniform float u_opacity;

			void main() {
				gl_FragColor = vec4(vColor, u_opacity);
			}
		`,
		transparent: true
	});
	const dots = new THREE.Points(dotsGeometry, dotsMaterial);
	return { points: dots, material: dotsMaterial };
}



export function earthSpiralDots(size: number, numberOfDots: number):  {points: THREE.Points, material: THREE.ShaderMaterial} {
	const dotsGeometry = new THREE.BufferGeometry();
	const spherePositions = new Float32Array(numberOfDots * 3);
	const sizes = new Float32Array(numberOfDots);
	const globeSize = size + 0.1;

	for (let i = 0; i < numberOfDots; i++) {
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(1 - 2 * Math.random());
		spherePositions[i * 3] = globeSize * Math.sin(phi) * Math.cos(theta);
		spherePositions[i * 3 + 1] = globeSize * Math.sin(phi) * Math.sin(theta);
		spherePositions[i * 3 + 2] = globeSize * Math.cos(phi);
		sizes[i] = Math.random() * 0.02 + 0.02;
	}
	dotsGeometry.setAttribute('position', new THREE.BufferAttribute(spherePositions, 3));
	dotsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));


	let spiralPositions = new Float32Array(numberOfDots * 3);
	let randoms = new Float32Array(numberOfDots);
	let colorRandoms = new Float32Array(numberOfDots);
	let animationOffset = new Float32Array(numberOfDots);

	const rows = 150;
	const totalHeight = 0.04 * numberOfDots / rows;
	for (let i = 0; i < numberOfDots; i++) {
		randoms[i] = Math.random();
		colorRandoms[i] = Math.random();
		animationOffset[i] = Math.random();
		//animationOffset.set([Math.floor(i/rows)/600], i);

		let theta = 0.002 * Math.PI * 2 * Math.floor(i/rows);
		let radius = 0.03 * Math.floor((i%rows) - rows/2);

		spiralPositions[i * 3] = radius * Math.cos(theta);
		spiralPositions[i * 3 + 1]= 0.04 * (Math.floor(i / rows)) - totalHeight/2;
		spiralPositions[i * 3 + 2] = radius * Math.sin(theta);
	}
	spiralPositions = spiralPositions.map((pos) => pos *= globeSize * 0.5);

	dotsGeometry.setAttribute('spiralPosition', new THREE.BufferAttribute(spiralPositions, 3));
	dotsGeometry.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1));
	dotsGeometry.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1));
	dotsGeometry.setAttribute('offset', new THREE.BufferAttribute(animationOffset, 1));
	

	const dotsMaterial = new THREE.ShaderMaterial({
		extensions: {
			//derivatives: '#extension GL_OES_standard_derivatives : enable'
		},
		side: THREE.DoubleSide,
		uniforms: {
			u_time: { value: 0.0 },
			u_progress: { value: 0.0 },
			resolution: { value: new THREE.Vector4() },
			uColor1: { value: new THREE.Color(0xd2fcf1) },
			uColor2: { value: new THREE.Color(0x293583) },
			uColor3: { value: new THREE.Color(0x1954ec) }, 
		},
		vertexShader: `
			uniform float u_time;
			uniform float u_progress;
			varying vec2 vUv;
			varying vec3 vPosition;
			uniform sampler2D texture;
			
			varying float vColorRandom;
			varying float progress;
			varying float scale;
			varying float minPointSize;

			attribute vec3 spiralPosition;
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
				
				minPointSize = 10.0;
				scale = u_progress;
				progress = clamp(u_progress, 0.0, 2.0);
				vec3 newPos = mix(position, spiralPosition, clamp(progress, 0.0, 1.0));
				if (progress > 0.0) {
					float t = sin(u_time) + 0.3;
					newPos.x += clamp((t * (offset + 1.0) * 1.2 - 1.0), 0.0, 1.0) * 5.0 * offset * 1000.0;
					newPos.z -= clamp((t * (offset + 1.0) * 1.2 - 1.0), 0.0, 1.0) * 5.0 * offset * 1000.0;
					newPos.y += clamp((t * (offset + 1.0) * 1.2 - 1.0), 0.0, 1.0) * 2.0 * offset * 1000.0;

					//float uvOffset = uv.y;
					//newPos.y += 3.0 * quarticInOut( clamp(0.0, 1.0, (progress - uvOffset*0.6)/0.4) );
				}
				if (progress > 1.0) {
					//newPos.y = mix(newPos.y, 0.0, clamp(progress - 1.0, 0.0, 1.0));
					newPos = mix(mix(newPos, position, clamp(progress - 1.0, 0.0, 1.0)), vec3(0.0), clamp(progress - 1.0, 0.0, 1.0));
					scale = 1.0 - clamp(progress - 1.0, 0.0, 1.0);
					minPointSize = clamp((2.0 - progress) * 10.0, 0.0, 10.0);
				}
				vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
				gl_PointSize = (minPointSize * randoms + 4.0 * scale)  * (1000.0 / - mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
			}
		`,
		fragmentShader: `
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
		blending: THREE.AdditiveBlending
	});


	const dots = new THREE.Points(dotsGeometry, dotsMaterial);
	return { points: dots, material: dotsMaterial };
}





/*
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
*/