import * as THREE from 'three';

export function createParticles(count: number = 100, particleSize: number = 0.01, radius: number = 5, coreRadius: number = 0): {
	particles: THREE.Points;
	particleGeometry: THREE.BufferGeometry;
	particleMaterial: THREE.ShaderMaterial;
} {
	const particleGeometry = new THREE.BufferGeometry();
	const particleMaterial = new THREE.ShaderMaterial({
		uniforms: {
			progress: { value: 0.0 },
			size: { value: particleSize }
		},
		vertexShader: `
			uniform float progress;
			uniform float size;

			attribute float random;
			attribute float velocity;

			void main() {
				vec3 newPos = position;
				
				// Eratic movements:
				//newPos.x += velocity * cos(newPos.x * progress);
				//newPos.y += velocity * sin(newPos.x * progress); // + velocity * sin(newPos.y * progress);
				//newPos.z -= velocity * cos(newPos.z * progress);

				vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
				gl_PointSize = size * (300.0 / - mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
			}
		`,
		fragmentShader: `
			void main() {
				float alpha = 1.0 - smoothstep(-0.2, 0.5, length(gl_PointCoord - vec2(0.5)));
				gl_FragColor = vec4(0.82, 0.99, 0.95, alpha);
			}
		`,
		transparent: true
	});

	const positions = new Float32Array(count * 3);
	const velocities = new Float32Array(count);
	const randoms = new Float32Array(count);

	for (let i = 0; i < count * 3; i++) {
		let x, y, z;
		do {
			x = (Math.random() - 0.5) * radius * 2;
			y = (Math.random() - 0.5) * radius * 2;
			z = (Math.random() - 0.5) * radius * 2;
		} while (Math.sqrt(x * x + y * y + z * z ) < coreRadius);

		positions[i * 3] = x;
		positions[i * 3 + 1] = y;
		positions[i * 3 + 2] = z;

		velocities[i] = (Math.random() - 0.5) * 1.1; // Random velocities
		randoms[i] = Math.random();
	}

	particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
	particleGeometry.setAttribute('random', new THREE.BufferAttribute(randoms, 1));

	const particles = new THREE.Points(particleGeometry, particleMaterial);

	return {
		particles,
		particleGeometry,
		particleMaterial
	}
}