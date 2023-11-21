<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import type { Unsubscriber, Writable } from "svelte/store";
    import { Button } from "carbon-components-svelte";
	import { Person, Close, IbmCloudDirectLink_2Connect } from "carbon-icons-svelte";

	import type { IPhase, ItemInterface } from "$lib/components/interfaces";
    import BottomNav from "./BottomNav.svelte";
    import { getBlock, getBlockIndex } from "$lib/utils";

	export let selectedItem: Writable<ItemInterface | undefined>;
	export let config: { phases: Array<IPhase>};

	let unsubscriber: Unsubscriber;
	let doc: Document;
	
	onMount(() => {
		doc = document;
		unsubscriber = selectedItem.subscribe((i) => i ? doc.body.classList.add("modal-open") : doc.body.classList.remove("modal-open"));
		doc.addEventListener("keydown", processKeyEvent);
	});

	onDestroy(() => {
		if (unsubscriber) unsubscriber();
		doc?.body.classList.remove("modal-open");
		doc?.removeEventListener("keydown", processKeyEvent);
	});


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
	
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if $selectedItem}

	<div class="modal-container">
		<div class="modal modal-text">
			<div class="modal-inner">
				<div class="modal-close-button">
					<Button
						kind="tertiary"
						size="lg"
						iconDescription="Close"
						icon={Close}
						on:click={() => selectedItem.set(undefined)}
					/>
				</div>
				<div class="modal-info">
					<div class="modal-info-persons">
						<div class="modal-info-header">Team</div>
						{#each $selectedItem?.persons as person}
						<div class="modal-info-person">
							<Person size={24} />
							<div class="modal-info-person-name">{person}</div>
						</div>
						{/each}
					</div>
				</div>
				<div class="modal-content">
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
									<div class="block-content">
										<div class="block-header">{block.subtitle}</div>
										<div class="block">{@html block.text}</div>
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
			<BottomNav {selectedItem} {config} />

		</div>
		<div class="inner-overlay"></div>
		<div class="modal-overlay" class:modal-open={selectedItem !== undefined} on:click={() => selectedItem.set(undefined)}></div>
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

	.modal-container {
		position: fixed;
		width: 100vw;
		height: 100vh;
		left: 0;
		top: 0;
		z-index: 1;
	}
	.modal-overlay {
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		background-color: transparent;
		z-index: 1;
		transition: background-color 0.4s;
	}

	.modal-overlay.modal-open {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(5px);
	}

	.modal {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		height: 90%;
		z-index: 2;
		background-color: rgba(0, 17, 43, 0.82);
		color: #fff;
		backdrop-filter: blur(0px);
		border-radius: 8px;
		overflow: hidden;
	}
	.modal-inner {
		padding: 50px 50px 100px;
		height: 100%;
		overflow-x: hidden;
		-ms-overflow-style: none;  /* IE and Edge */
		scrollbar-width: none;  /* Firefox */
	}
	.modal-inner::-webkit-scrollbar {
		display: none;
	}
	.modal-inner:before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 50px;
		background: linear-gradient(180deg, rgba(0, 17, 43, 1) 50%, rgba(0, 17, 43, 0) 100%);
	}
	.inner-overlay {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		height: 90%;
		opacity: 0.75;
		z-index: 1;
		background-image: url(https://storage.googleapis.com/ahp-research/projects/communicatie/images/render_6-2mb.png);
		background-size: cover;
		background-position: center;
		border-radius: 8px;
	}
	.modal-close-button {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.modal-header {
		display: flex;
		align-items: center;
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
	.modal-text {
		font-size: 1.1rem;
		font-weight: 300;
		line-height: 1.5;
	}
	.modal-content {
		max-width: 1100px;
		margin: auto;
	}

	.modal-info {
		margin: 0 40px 30px 30px;
		padding: 8px 20px 15px;
		float: right;
		border-radius: 8px;
		background: linear-gradient(45deg, rgba(0, 17, 43, 0.82) 0%, rgba(0, 17, 43, 0) 90%);
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
	
	.content-block {
		display: grid;
		grid-template-columns: 100px 1fr;
		align-items: center;
		margin-top: 30px;
	}
	.block-icon {
		width: 80%;
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