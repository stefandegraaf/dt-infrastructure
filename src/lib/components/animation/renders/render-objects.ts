
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
