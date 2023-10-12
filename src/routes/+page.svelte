<script lang="ts">
	import content from "$lib/files/concept-dt-config.json";
	import Item from "$lib/components/Item.svelte";
    import CustomStyle from "$lib/style/CustomStyle.svelte";
    import ContentModal from "$lib/components/ContentModal.svelte";
	import type { ItemInterface } from "$lib/components/interfaces";

	let selectedItem: ItemInterface | undefined;

	let config: any;
	loadConfig();
	async function loadConfig(): Promise<void> {
		try {
			const fileservConfig = await fetch("https://fileserv.beta.geodan.nl/dtconfigs/concept-dt-config.json");
			config = await fileservConfig.json();
		} catch (e) {
			config = content;
		}
	}

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

	<div id="top-banner">
		<div id="top-banner-overlay"></div>
	</div>

	<div id="steps-overview">
		{#if config && config.items}
		{#each config.items as item, index}
			<Item {item} {index} on:select={() => selectedItem = item}/>
		{/each}
		{/if}
	</div>

	<ContentModal bind:selectedItem />

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
		background-image: url(https://fileserv.beta.geodan.nl/images/digital_twin_render.webp);
		height: 500px;
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


	#steps-overview {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 50px;
		row-gap: 30px;
		justify-content: space-between;
		padding: 0 50px;
		max-width: 1400px;
		margin: 70px auto;
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
		height: 100px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

</style>