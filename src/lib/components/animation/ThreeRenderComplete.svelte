<script lang="ts">
    import { onDestroy, onMount } from "svelte";
	import { writable, type Writable } from "svelte/store";

	import * as THREE from 'three';
    import type { RenderHandler } from "./render-handler";

	export let renderer: RenderHandler;
	
	let canvas: HTMLElement | null;

	onMount(() => {
		canvas = document.getElementById('module-canvas');
		if (!canvas) {
			throw new Error('Canvas not found');
		}
		//init canvas and couple the renders
		renderer.init(canvas);
	});
	
	onDestroy(() => {
		renderer.detach();
	});

	
</script>


<canvas id="module-canvas"></canvas>


<style>

  #module-canvas {
	display: block;
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
  }
</style>