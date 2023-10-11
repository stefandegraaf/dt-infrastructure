<script lang="ts">
	import content from "$lib/files/steps-content.json";
	import Step from "$lib/components/Step.svelte";
    import CustomStyle from "$lib/style/CustomStyle.svelte";

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


	</div>

	<div id="steps-overview">
		{#if content.steps}
		{#each content.steps as step, index}
			<Step {step} {index} />
		{/each}
		{/if}
	</div>
</div>


<CustomStyle />

<style>

	#dt-concept-body {
		background-color: #fcfcfa;
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
		background-image: url(https://fileserv.beta.geodan.nl/images/andijk_pointcloud.PNG);
		height: 500px;
		background-size: cover;
		background-position: center;
	}


	#steps-overview {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 50px;
		justify-content: space-between;
		padding: 0 50px;
		max-width: 1400px;
		margin: 50px auto 30px;
	}

</style>