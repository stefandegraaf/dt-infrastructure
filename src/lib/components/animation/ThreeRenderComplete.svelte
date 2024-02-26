<script lang="ts">
    import { onDestroy, onMount } from "svelte";
	import type { Writable } from "svelte/store";

	import * as THREE from 'three';
    import { ThreeRenderComplete } from "./render-complete";

	export let index: Writable<number | undefined>;

	let canvas: HTMLElement | null;
	let renderer: ThreeRenderComplete;

	onMount(() => {
		canvas = document.getElementById('module-canvas');
		if (!canvas) {
			throw new Error('Canvas not found');
		}
		renderer = new ThreeRenderComplete(canvas, index);
	});
	
	onDestroy(() => {
		renderer.destroy();
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