<script lang="ts">
	import { writable, type Writable } from "svelte/store";
    import { CaretDown } from "carbon-icons-svelte";

	import fallback from "$lib/files/concept-dt-config.json";
	import Item from "$lib/components/Item.svelte";
    import CustomStyle from "$lib/style/CustomStyle.svelte";
    import ContentModal from "$lib/components/ContentModal.svelte";
	import type { IPhase, ItemInterface } from "$lib/components/interfaces";
    import HeaderThree from "$lib/components/HeaderThree.svelte";
	import { RenderHandler } from "$lib/components/animation/render-handler";
    import { getBlockIndex } from "$lib/utils";

	let selectedItem: Writable<ItemInterface | undefined> = writable(undefined);
	let config: { phases: Array<IPhase>};
	
	async function setConfig(): Promise<void> {
		//config = await loadConfig();
		const loaded = setBlockNumbers(fallback);
		config = loaded;
	}
	async function loadConfig(): Promise<any> {
		try {
			const fileservConfig = await fetch("https://storage.googleapis.com/ahp-research/projects/sogelink/hackathon/backup-1419concept-dt-config.json");
			const response = await fileservConfig.json();
			return response;
		} catch (e) {
			return fallback;
		}
	}

	function setBlockNumbers(rawConfig: any): { phases: Array<IPhase>} {
		const configFlat = rawConfig.phases.flatMap((phase: IPhase) => phase.blocks);
		rawConfig.phases.forEach((phase: IPhase) => phase.blocks.map((block: ItemInterface) => {
			const index = configFlat.findIndex((item: ItemInterface) => item === block);
			block.index = index + 1;
			block.phase = phase.phase;
		}));
		return rawConfig;
	}
	setConfig();

	
	const selectedIndex: Writable<number | undefined> = writable(0);
	$: $selectedItem && selectedIndex.set(getBlockIndex(config, $selectedItem));
	let selectedIndexNumber: Writable<number> = writable(0);
	$: if ($selectedIndex !== undefined) selectedIndexNumber.set($selectedIndex);
	const renderer = new RenderHandler(selectedIndexNumber);


	function scrollDown(): void {
		const canvasHeight = document.getElementById('header-canvas')?.clientHeight ?? window.innerHeight;
		const scrollY = Math.max(window.scrollY, canvasHeight + 70); 
		window.scroll({
			top: scrollY,
			//behavior: 'smooth'
		});
	}

</script>



<div id="dt-concept-body">
	
	<HeaderThree on:select={() => {
		scrollDown();
		selectedItem.set(config.phases[0].blocks[0])
	}} />

	<div class="phases">
		{#if config && config.phases}
			{#each config.phases as phase, i}
				{#if i !== 0}
					<div class="phase-header">
						<div class="phase-header-title">{phase.phase}</div>
						<CaretDown size={32} />
					</div>
					<div class="block-overview">
						{#each phase.blocks as item }
							<Item {item} on:select={() => {
								scrollDown();
								selectedItem.set(item)
								}}/>
						{/each}
					</div>
				{/if}
			{/each}
			<ContentModal bind:selectedItem {config} {renderer} />
		{/if}
	</div>
	<div class="phase-header">
		<div class="phase-header-title">Result</div>
		<CaretDown size={32} />
	</div>
	<div id="embedded-viewer-container">
		<embed src="https://sogelink.beta.geodan.nl/" id="embedded-viewer">
	</div>

	<div id="footer">
		<a href="https://www.sogelink.com/" target="_blank">
			<img id="footer-logo" src="https://bim-w.com/wp-content/uploads/SOGELINK_Logo_Responsive_01_Bleu.png" alt="Sogelink" />
		</a>
		<span>Copyright © {new Date().getFullYear()} | Created by Sogelink Group</span>
		<a href="https://www.geodan.com/cookie-privacy-policy/" target="_blank">Privacy, liability and copyright</a>
	</div>
</div>




<CustomStyle />

<style>

	#dt-concept-body {
		background-color: #fcfcfa;
		position: relative;
	}

	.phases {
		padding-top: 40px;
	}
	.phase-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 60px 0 30px 0;
	}
	.phase-header-title {
		font-size: 2.5rem;
		font-weight: 600;
	}

	.block-overview {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
		column-gap: 50px;
		row-gap: 70px;
		padding: 0 50px;
		max-width: 1600px;
		margin: 0 auto 70px;
	}


	#embedded-viewer-container {
		overflow: hidden;
		box-shadow: 0 0 8px 8px rgba(0,0,0,.3);
	}
	#embedded-viewer {
		width: 100%;
		height: 700px;
		position: relative;
		top: -3rem;
		margin-bottom: -3rem;
	}

	#footer {
		background-color: var(--dark-main);
		color: #fff;
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		
	}
	#footer-logo {
		filter: grayscale(1) invert(1);
		width: 200px;
		margin-right: 20px;
	}

</style>