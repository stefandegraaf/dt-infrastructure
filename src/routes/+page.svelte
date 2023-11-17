<script lang="ts">
	import { writable, type Writable } from "svelte/store";
    import { CaretDown } from "carbon-icons-svelte";

	import fallback from "$lib/files/concept-dt-config.json";
	import Item from "$lib/components/Item.svelte";
    import CustomStyle from "$lib/style/CustomStyle.svelte";
    import ContentModal from "$lib/components/ContentModal.svelte";
	import type { IPhase, ItemInterface } from "$lib/components/interfaces";

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
			block.index = index;
		}));
		return rawConfig;
	}
	setConfig();


</script>


<div id="dt-concept-body">
	<div id="top-intro">
		<div id="top-intro-container">
			<div id="top-intro-left">
				<div class="top-heading-sup">Overview</div>
				<div class="top-heading">From Concept to Digital Twin</div>
			</div>
			<div id="top-intro-right">
				This series provides a look at the challenges, techniques, tools, and processes involved in realising our design, technology and sustainability ambitions for the Sogelink Digital Twin. Follow its journey from concept to usable Digital Twin.
			</div>
		</div>
		<img id="top-logo" src="https://bim-w.com/wp-content/uploads/SOGELINK_Logo_Responsive_01_Bleu.png" alt="Sogelink" />
	</div>

	<!--<ThreeDeeTilesRender />-->

	<div id="top-banner">
		<div id="top-banner-overlay"></div>
	</div>

	{#if config && config.phases}
		{#each config.phases as phase}
			<div class="phase-header">
				<div class="phase-header-title">{phase.phase}</div>
				<CaretDown size={32} />
			</div>
			<div class="block-overview">
				{#each phase.blocks as item }
					<Item {item} on:select={() => selectedItem.set(item)}/>
				{/each}
			</div>
		{/each}
		<ContentModal bind:selectedItem {config} />
	{/if}

	<div class="phase-header">
		<div class="phase-header-title">Result</div>
		<CaretDown size={32} />
	</div>
	<div id="embedded-viewer-container">
		<embed src="https://sogelink.beta.geodan.nl/" id="embedded-viewer">
	</div>


	<div id="footer">
		Created by Sogelink Group
	</div>
</div>




<CustomStyle />

<style>

	#dt-concept-body {
		background-color: #fcfcfa;
		position: relative;
	}

	#top-intro {
		position: relative;
	}
	#top-intro-container {
		display: grid;
		grid-template-columns: 2fr 3fr;
		column-gap: 50px;
		justify-content: space-between;
		align-items: center;
		padding: 50px 50px 40px 180px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.top-heading-sup {
		font-size: 1.5rem;
		font-weight: 400;
	}
	.top-heading {
		font-size: 2.5rem;
		font-weight: 600;
	}
	#top-intro-right {
		font-size: 1.1rem;
		line-height: 1.2;
		font-weight: 600;
	}
	#top-logo {
		position: absolute;
		top: 50%;
		left: 20px;
		transform: translateY(-50%);
		width: 150px;
	}


	#top-banner {
		background-image: url(https://storage.googleapis.com/ahp-research/projects/communicatie/images/render_6-2mb.png);
		height: 500px;
		width: 110%;
		margin-left: -5%;
		background-size: cover;
		background-position: center;
		position: relative;
	}
	#top-banner-overlay {
		/*background: linear-gradient(45deg, transparent 70%, rgba(252, 252, 250, 100%) 90%);*/
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		right: 0;
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
		height: 100px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

</style>