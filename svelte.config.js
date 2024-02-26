import adapter from '@sveltejs/adapter-static';
//import { vitePreprocess } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import preprocess from "svelte-preprocess";
import { optimizeImports } from "carbon-preprocess-svelte";
import glsl from 'vite-plugin-glsl';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	
	preprocess: [
		preprocess({
			typescript: true
		}),
		optimizeImports({}),
		vitePreprocess()
	],

	//preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		paths: {
			base: process.argv.includes('dev') ? '' : `/${process.env.BASE_PATH}/src`,
        }
	},

	vite: {
		plugins: [
			glsl()
		],
		ssr: {
			noExternal: ['vite-plugin-glsl']
		}
	}
};

export default config;

