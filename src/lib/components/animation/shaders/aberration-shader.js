export let AberrationShader = {
	uniforms: {
		"tDiffuse": { value: null },
		"amount": { value: 0.5 },
		"angle": { value: 0.0 }
	},
	vertexShader: `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform float distort;
		uniform float time;
		varying vec2 vUv;


		vec2 barrelDistortion(vec2 coord, float amt) {
			vec2 cc = coord - 0.5;
			float dist = dot(cc, cc);
			return coord + cc * dist * amt;
		}
		
		float sat( float t ) {
			return clamp( t, 0.0, 1.0 );
		}
		
		float linterp( float t ) {
			return sat( 1.0 - abs( 2.0*t - 1.0 ) );
		}
		
		float remap( float t, float a, float b ) {
			return sat( (t - a) / (b - a) );
		}
		
		vec4 spectrum_offset( float t ) {
			vec4 ret;
			float lo = step(t,0.5);
			float hi = 1.0-lo;
			float w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );
			ret = vec4(lo,1.0,hi, 1.) * vec4(1.0-w, w, 1.0-w, 1.);
		
			return pow( ret, vec4(1.0/2.2) );
		}
		
		const float max_distort = 0.8;
		const int num_iter = 5;
		const float reci_num_iter_f = 1.0 / float(num_iter);
		
		void main() {	
			//vec2 uv=(gl_FragCoord.xy/vUv.xy*.5)+.25;
			vec2 zUv = (vUv - vec2(0.5)) * 0.95 + vec2(0.5);
			vec4 sumcol = vec4(0.0);
			vec4 sumw = vec4(0.0);	
			for ( int i=0; i<num_iter; ++i ) {
				float t = float(i) * reci_num_iter_f;
				vec4 w = spectrum_offset( t );
				sumw += w;
				sumcol += w * texture2D( tDiffuse, barrelDistortion(zUv, .2 * max_distort*t ) );
			}
			
			gl_FragColor = sumcol / sumw;
		}
		`
};
