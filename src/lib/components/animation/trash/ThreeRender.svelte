<script lang="ts">
    import { onDestroy, onMount } from "svelte";
	import * as THREE from 'three';
    import { ThreeRender, ThreeDeeTilesRender, GLBRender, EarthRender } from "../render";

	const glbs = [
		"https://storage.googleapis.com/ahp-research/projects/communicatie/images/tree.glb",
		"https://storage.googleapis.com/ahp-research/maquette/models/ship_c.glb",
		"https://storage.googleapis.com/ahp-research/maquette/models/sm_windturbine.glb"
	]

	const tilesets = [
		//"https://storage.googleapis.com/ahp-research/maquette/tki/hhnk/ondergrondmodel/cross_sections/221205/tileset.json",
		//"https://storage.googleapis.com/ahp-research/maquette/kadaster/bim/hoevesteijn/hoevesteijn_gebouw_offset/tileset.json",
		//"https://storage.googleapis.com/ahp-research/maquette/rws/moerdijk_rvt/moerdijkbrug_tiles/tileset.json",
		//"https://storage.googleapis.com/ahp-research/projects/circulaire_grondstromen/uwdh/3dtiles/dtb_uwdh_nl_1_8/tileset.json",
		//"https://storage.googleapis.com/ahp-research/maquette/bim/tenpost/bim_second/tileset.json",
		"https://storage.googleapis.com/ahp-research/maquette/tki/hhnk/pointcloud/ilpendam/tileset.json",
		//"https://nasa-ammos.github.io/3DTilesRendererJS/example/data/tileset.json",
		//"https://raw.githubusercontent.com/NASA-AMMOS/3DTilesSampleData/master/msl-dingo-gap/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_sky/0528_0260184_to_s64o256_sky_tileset.json",
		//"https://raw.githubusercontent.com/NASA-AMMOS/3DTilesSampleData/master/msl-dingo-gap/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize_tileset.json",
	];

	export let settings: any;
	let scratchSettings: any;

	$: generateRender(), settings;

	let render: ThreeRender;
	let canvas: HTMLElement | null;

	onMount(() => {
		generateRender()
	});

	onDestroy(() => {
		render?.destroy();
	});

	function generateRender(): void {
		canvas = document.getElementById('canvas');
		if (!canvas) {
			return
		}
		if (!settings.type) {
			throw new Error('Type not found');
		}
		if (JSON.stringify(scratchSettings) === JSON.stringify(settings)) {
			return;
		}
		scratchSettings = settings;
		render?.destroy();

		if (settings.type === "3dtiles") {
			render = new ThreeDeeTilesRender(
				canvas,
				"https://storage.googleapis.com/ahp-research/projects/rws/ijsselbruggen/tiles/ijsselbrug_struc_1/tileset.json",
				//new THREE.Vector3(3879789, 336573, 5034260),
				new THREE.Vector3(3915674, 410808, 5001080),
				600
			);		
		} else if (settings.type === "earth") {
			render = new EarthRender(
				canvas,
				settings.texture,
				settings.size
			);
		} else {
			render = new GLBRender(
				canvas,
				settings.url,
				true
			);
		}
	}

</script>


<canvas id="canvas"></canvas>


<style>

  canvas {
	width: 100%;
	height: 100%;
	display: block;
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
  }
</style>