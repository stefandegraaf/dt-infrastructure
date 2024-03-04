import { sveltekit } from '@sveltejs/kit/vite';
import glsl from 'vite-plugin-glsl';

/** @type {import('vite').UserConfig} */
const config = {	
	plugins: [
		sveltekit(),
		/*
		{
			name: 'modify-imports',
			enforce: 'pre',
			transform(code, id) {
				if (id.endsWith('.svelte') || id.endsWith('.ts') || id.endsWith('.js')) {
					return {
						code: code.replace(/'three\/examples\/jsm\/loaders\/'/g, '\'three/addons/loaders/\''),
						map: null,
					};
				}
			}
		}*/
		glsl()
	]
	/*
	,
	ssr: {
		noExternal: ['vite-plugin-glsl']
	}
	*/
};

export default config;