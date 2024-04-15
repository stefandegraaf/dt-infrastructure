<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import type { Unsubscriber, Writable } from "svelte/store";
    import { Button } from "carbon-components-svelte";
	import { Person, Exit, IbmCloudDirectLink_2Connect } from "carbon-icons-svelte";

	import type { IPhase, ItemInterface } from "$lib/components/interfaces";
    import BottomNav from "./BottomNav.svelte";
    import { getBlock, getBlockIndex } from "$lib/utils";
    import ThreeRenderComplete from "./animation/ThreeRenderComplete.svelte";
	import type { RenderHandler } from "./animation/render-handler";


	export let selectedItem: Writable<ItemInterface | undefined>;
	export let config: { phases: Array<IPhase>};
	export let renderer: RenderHandler;

	let unsubscriber: Unsubscriber;
	
	onMount(() => {
		unsubscriber = selectedItem.subscribe((i) => i ? document.body.classList.add("modal-open") : document.body.classList.remove("modal-open"));
		document.addEventListener("keydown", processKeyEvent);
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (unsubscriber) unsubscriber();
		if (typeof document === 'undefined') return;
		document.body.classList.remove("modal-open");
		document.removeEventListener("keydown", processKeyEvent);
		window.removeEventListener('resize', handleResize);
	});

	function handleResize() {
		const modal = document.getElementById("modal");
		if (!modal) return;
		renderer.setRendererSize(modal);
	}

	function processKeyEvent(e: KeyboardEvent): void {
		if (e.key === "Escape") selectedItem.set(undefined);
		else if (e.key === "ArrowRight") {
			const index = getBlockIndex(config, $selectedItem);
			const nextBlock = getBlock(config, index + 1);
			if (nextBlock) selectedItem.set(nextBlock);
		}
		else if (e.key === "ArrowLeft") {
			const index = getBlockIndex(config, $selectedItem);
			const prevBlock = getBlock(config, index - 1);
			if (prevBlock) selectedItem.set(prevBlock);
		}
	}

	let rendererProgress = renderer.progressWritable;
	//$: progress = 1 - Math.pow(1 - $rendererProgress % 1, 3) * 100;
	$: progress = -1 * Math.sign(0.5 - ($rendererProgress % 1)) * Math.sin($rendererProgress % 1 * Math.PI);

	let flatConfig = config.phases.flatMap((phase: IPhase) => phase.blocks);
	
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if $selectedItem}

	<div class="modal-container modal-text">
		<div id="modal">
			<div class="modal-scrollbox">
				<div class="progress-bar">
					<div class="progress-bar-line-done" style="height: {100 * $rendererProgress / (flatConfig.length-1)}%"></div>
					<div class="progress-bar-moving-dot" style="top: {100 * $rendererProgress / (flatConfig.length-1)}%"></div>
					{#each flatConfig as item, i}
						<div class="progress-bar-dot" data-title="{item.title}" class:active={i === $rendererProgress} class:done={i < $rendererProgress + 0.12} on:click={() => selectedItem.set(item)}></div>
						{#if i < flatConfig.length - 1}
							<div class="progress-bar-line"></div>
						{/if}
					{/each}
				</div>
				<div class="modal-body" style="transform:translateX({progress * 300}%)">
					<div class="modal-close-button">
						<Button
							kind="tertiary"
							size="lg"
							iconDescription="Back to overview"
							icon={Exit}
							tooltipPosition="right"
							on:click={() => selectedItem.set(undefined)}
						/>
					</div>
					{#if $selectedItem?.persons?.length > 0}
						<div class="modal-info">
							<div class="modal-info-persons">
								<div class="modal-info-header">Team</div>
								{#each $selectedItem.persons as person}
								<div class="modal-info-person">
									<Person size={24} />
									<div class="modal-info-person-name">{person}</div>
								</div>
								{/each}
							</div>
						</div>
					{/if}
					<div class="modal-header">
						<svg class="modal-header-icon" version="1.0" xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 4961.000000 3508.000000">
							<g transform="translate(0.000000,3508.000000) scale(0.100000,-0.100000)" stroke="none">
								<path d="M24652 33870 c-166 -17 -324 -62 -462 -133 -154 -78 -13033 -7518
								-13113 -7575 -97 -70 -247 -224 -314 -322 -96 -143 -166 -304 -210 -485 -16
								-65 -18 -245 -21 -2465 -3 -2660 -7 -2484 63 -2697 83 -249 248 -484 447 -636
								40 -30 928 -580 1973 -1222 l1900 -1166 7 93 c3 51 11 955 18 2008 7 1053 16
								2172 20 2485 8 514 10 580 29 668 94 454 332 815 701 1062 76 51 9124 5196
								9167 5212 6 2 2141 -1245 4743 -2773 2603 -1528 4737 -2777 4744 -2777 10 0
								4672 2687 4688 2702 7 6 -13401 7752 -13620 7868 -234 124 -506 179 -760 153z"/>
								<path d="M24545 22814 c-105 -19 -198 -47 -294 -88 -84 -37 -3728 -2136 -3851
								-2220 -110 -74 -264 -233 -343 -352 -99 -149 -153 -274 -200 -464 l-21 -85 -3
								-2233 c-3 -1922 -1 -2246 11 -2330 54 -359 242 -670 536 -889 63 -47 3690
								-2144 3820 -2208 187 -93 353 -130 585 -129 235 1 403 38 585 129 116 59 3743
								2156 3810 2203 271 193 473 514 537 852 17 89 18 226 18 2330 l0 2235 -22 100
								c-29 130 -56 211 -104 314 -88 188 -246 383 -409 503 -70 52 -3694 2150 -3825
								2215 -92 45 -160 71 -270 99 -88 23 -124 27 -290 30 -139 2 -211 -1 -270 -12z"/>
								<path d="M34640 17393 c2 -546 -33 -4850 -40 -4963 -16 -240 -68 -437 -170
								-640 -126 -251 -320 -474 -547 -628 -42 -29 -6270 -3569 -9045 -5142 l-137
								-78 -4838 2840 c-2661 1562 -4848 2845 -4860 2850 -18 9 -324 -163 -2247
								-1263 -1694 -970 -2223 -1276 -2213 -1285 32 -30 13634 -7873 13711 -7907 187
								-81 375 -114 595 -104 199 9 352 48 521 132 100 49 12984 7487 13080 7550 247
								164 452 442 534 727 59 205 57 93 54 2568 l-4 2265 -22 100 c-43 186 -129 372
								-240 523 -72 96 -224 240 -323 305 -81 53 -3793 2217 -3804 2217 -3 0 -5 -30
								-5 -67z"/>
							</g>
						</svg>
						<div>
							<span>{$selectedItem.phase}</span>
							<h2>{$selectedItem.title}</h2>
						</div>
					</div>
					<div class="content-blocks">
						{@html $selectedItem.content}
						{#if $selectedItem.components}
							{#each $selectedItem.components as block}
								<div class="content-block">	
									<div class="block-icon">
									{#if block.icon}
										<img src={block.icon} alt="icon" />
									{:else}
										<IbmCloudDirectLink_2Connect size={32} />
									{/if}
									</div>
									<div class="block-text">
										<div class="block-header">{block.subtitle}</div>
										<div>{@html block.text}</div>
									</div>
								</div>
							{/each}
						{/if}
						{#if $selectedItem.contentAfter}
							{@html $selectedItem.contentAfter}
						{/if}
					</div>
				</div>
			</div>
		</div>
		<BottomNav {selectedItem} {config} />
		<ThreeRenderComplete {renderer} />
	</div>

{/if}


 <style>

	:global(body.modal-open) {
		overflow: hidden;
	}

	:global.module-img {
		max-width: 100%;
		max-height: 450px;
		width: auto;
		height: auto;
		display: block;
		margin: 30px auto;
		border-radius: 5px;
	}

	:global(a) {
		color: #fff;
		font-weight: 700;
		text-decoration: none;
	}
	:global(a:hover) {
		color: #ddf4ff;
	}

	:global(.bx--btn--tertiary) {
		border-width: 0px;
		color: #bae8ff;
	}
	:global(.bx--btn__icon) {
		width: 22px !important;
		height: 22px !important;
	}
	:global(.bx--assistive-text) {
		background-color: #4cabd8 !important;
	}
	:global(.bx--btn::before) {
		border-right-color: #4cabd8 !important;
	}


	.modal-container {
		position: fixed;
		width: 100vw;
		height: 100vh;
		left: 0;
		top: 0;
		z-index: 1;
		background-color: rgba(0, 11, 28, 0.96);
		backdrop-filter: blur(5px);
	}
	.modal-text {
		color: #fff;
		font-size: 1.1rem;
		font-weight: 300;
		line-height: 1.5;
	}

	#modal {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: 100%;
		z-index: 2;
		border-radius: 3px;
		overflow: hidden;
	}
	.modal-scrollbox {
		padding: 100px 50px 400px 80px;
		height: 100%;
		overflow-x: hidden;
		-ms-overflow-style: none;  /* IE and Edge */
		scrollbar-width: none;  /* Firefox */
	}
	
	.modal-body {
		background-color: rgba(0, 13, 34, 0.75);
		backdrop-filter: blur(8px);
		position: relative;
		z-index: 4;
		max-width: 58vw;
		margin-left: 20px;
	}
	.modal-close-button {
		position: absolute;
		top: -1px;
		right: -1px;
		z-index: 5;
	}
	.modal-header {
		display: flex;
		align-items: center;
		position: relative;
		z-index: 3;
		padding: 20px 40px;
	}
	.modal-header h2 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 30px;
	}
	.modal-header-icon {
		fill: #fff;
		width: 30px;
		margin-right: 15px;
	}
	
	.progress-bar {
		position: relative;
		float: left;
		width: 30px;
		margin-top: 15px;
		margin-left: -20px;
		z-index: 5;
		--progress-bar-color: #bae8ff;
	}
	.progress-bar-dot {
		width: 10px;
		height: 10px;
		background-color: transparent;
		border: 2px solid var(--progress-bar-color);
		border-radius: 50%;
		margin: 0 auto;
		position: relative;
		cursor: pointer;
		z-index: 1;
	}
	.progress-bar-dot.active {
		background-color: var(--progress-bar-color);
		border-color: var(--progress-bar-color);
	}
	.progress-bar-dot.done {
		background-color: var(--progress-bar-color);
	}
	.progress-bar-moving-dot {
		position: absolute;
		background-color: transparent; /* HIDDEN */
		left: 50%;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		transform: translateY(-50%) translateX(-50%);
	}

	.progress-bar-line {
		width: 2px;
		height: 25px;
		margin: auto;
		background-color: rgba(255, 255, 255, 0.2);
	}
	.progress-bar-line-done {
		position: absolute;
		width: 2px;
		top: 0;
		left: 50%;
		transform: translate(-50%);
		background-color: var(--progress-bar-color);
		/*transition: height 0.3s ease;*/
	}
	
	.progress-bar-dot::after {
		content: attr(data-title);
		position: absolute;
		bottom: 50%;
		right: -10px;
		transform: translate(100%, 50%);
		background-color: #bae8ff;
		color: #000;
		font-weight: 500;
		letter-spacing: 0.5px;
		padding: 2px 15px;
		border-radius: 2px;
		white-space: nowrap;
		opacity: 0;
		transition: opacity 0.3s ease;
		font-family: Calibri, sans-serif;
	}

	.progress-bar-dot:hover::after {
		opacity: 1;
	}


	.modal-info {
		margin: 0 60px 40px 40px;
		padding: 8px 20px 15px;
		float: right;
		border-radius: 3px;
		background: linear-gradient(45deg, rgba(0, 17, 43, 0.3) 0%, rgba(0, 17, 43, 0) 90%);
	}
	.modal-info-header {
		font-size: 1.2rem;
		font-weight: 600;
	}
	.modal-info-person {
		display: flex;
		align-items: center;
		column-gap: 12px;
		margin-top: 10px;
		font-size: 1rem;
		
	}
	
	.content-blocks {
		position: relative;
		z-index: 3;
		padding: 0 40px;
		padding-bottom: 30px;
	}
	.content-block {
		width: 100%;
		display: grid;
		grid-template-columns: 100px 1fr;
		align-items: center;
		margin-top: 30px;
	}
	.block-icon {
		width: 80%;
	}
	.block-text {
		border-radius: 3px;
		padding: 15px 25px;
	}
	.block-icon img {
		width: 100%;
	}
	.block-header {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 10px;
	}

 </style>