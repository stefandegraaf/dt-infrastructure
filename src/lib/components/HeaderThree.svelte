<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
	import { writable, type Writable } from "svelte/store";

    import { HeaderRender } from "./animation/renders/header-render";


	let canvas: HTMLElement | null;
	let renderer: HeaderRender | undefined;

	const startAnimationProgress: Writable<number> = writable(0);
	$: progress = Math.min($startAnimationProgress + 0.1, 1);

	onMount(() => {
		canvas = document.getElementById('header-canvas');
		if (!canvas) {
			throw new Error('Canvas not found');
		}
		renderer = new HeaderRender(canvas, startAnimationProgress);


		const headerLogo = document.getElementById('header-logo');
		const headerHeading = document.getElementById('header-heading');
		const headerButton = document.getElementById('header-button');
		window.addEventListener('scroll', () => {
			const offset = window.scrollY;
			if (!headerLogo || !headerHeading || !headerButton) return;
			headerLogo.style.transform = `translateY(${offset * 0.4}px)`;
			headerHeading.style.transform = `translateY(${offset * 0.4}px)`;
			headerButton.style.transform = `translateY(${offset * 0.35}px)`;
		});
	});
	
	onDestroy(() => {
		renderer?.destroy();
	});

	const dispatch = createEventDispatcher();

	
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="header" on:click={() => dispatch('select2')}>
	<canvas id="header-canvas"></canvas>
	<div id="header-content" style="transform:scale({progress}); left: max(50px, {20 * (1 - progress) + 6}%); top: {20 * progress}%; opacity: {progress}">
		<img id="header-logo" src="https://bim-w.com/wp-content/uploads/SOGELINK_Logo_Responsive_01_Bleu.png" alt="Sogelink" />
		<div id="header-heading">From Concept to Digital Twin</div>
		<div id="header-text">
			This series provides a look into the challenges and techniques for creating the Sogelink Digital Twin. Follow its journey from concept to an interactive and dynamic data environment.
		</div>
		<button id="header-button" on:click={() => dispatch('select')}>START THE JOURNEY</button>
	</div>
</div>

<style>
	
	#header {
		width: 100%;
		height: max(100vh, 1000px);
		display: block;
		position: relative;
	}

	#header-canvas {
		width: 100%;
		height: 100%;
		background-color: #121212;
		/*background: radial-gradient(circle  at right top, rgba(0,17,43,1) 0%, rgba(18, 18, 18,1) 100%);*/
	}
	
	#header-content {
		position: absolute;
		left: max(50px, 6%);
		top: 20%;
		width: 40%;
		height: 100%;
		z-index: 1;
		color: #fff;
	}

	#header-heading {
		font-size: 5.5em;
		font-weight: bold;
	}

	#header-logo {
		width: 180px;
		height: auto;
		filter: grayscale(1) invert(1);
	}

	#header-text {
		font-size: 1.2em;
		font-weight: 600;
		line-height: 1.5rem;
		margin-top: 40px;pointer-events: none;
		max-width: 600px;
	}

	#header-button {
		background: linear-gradient(15deg, rgb(0, 17, 43) 0%, #00e1ff 100%);
		color: #fff;
		border: 1px solid #00e1ff;
		font-weight: 900;
		padding: 15px 30px;
		border-radius: 5px;
		font-size: 1.5em;
		margin-top: 80px;
		cursor: pointer;
	}
	#header-button:hover {
		background-color: #ddd;
	}

</style>