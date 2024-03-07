<script lang="ts">

	import ThreeDeeTilesRender from "$lib/components/animation/trash/ThreeDeeTilesRenderTest.svelte";
	import CustomStyle from "$lib/style/CustomStyle.svelte";


</script>

<CustomStyle />


<ThreeDeeTilesRender/>
<section class="section parallax-bg" style="background-image: url(https://storage.googleapis.com/ahp-research/projects/sogelink/hackathon/images/banner2.jpg)">
	<div class="section-1-overlay"></div>
	<div class="content" id="content-1">
		<div class="top-heading">Digital Twin</div>
		<div class="top-heading">From Concept to Digital Twin</div>
	</div>
	<div class="content" id="content-2">
		This series provides a look at the challenges, techniques, tools, and processes involved in realising our design, technology and sustainability ambitions for the Sogelink Digital Twin. Follow its journey from concept to usable Digital Twin.
	</div>
</section>



<section class="section parallax-bg" style="background-image: url(https://storage.googleapis.com/ahp-research/projects/sogelink/hackathon/images/requirementanalyse.jpg)">
	<div class="section-3-overlay"></div>
	<div class="content" id="content-4">
	</div>
	<div id="embedded-viewer-container">
		<embed src="https://sogelink.beta.geodan.nl/" id="embedded-viewer">
	</div>
	

	<div class="content" id="content-4">
	</div>

</section>





<style>

	

	.section {
		position: relative;
	}
	.parallax-bg {
		height: 100%;
		width: 100%;

		/* Create the parallax scrolling effect */
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		background-attachment: fixed;
		background-position: top center;
	}
	.content {
		position: relative;
		z-index: 1;
	}

	.section-1-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(0deg, rgb(22, 22, 26) 0, transparent 60%);
		z-index: 0;
	}
	.section-3-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(180deg, rgba(22, 22, 26, 100%) 0, transparent 20%);
		z-index: 0;
	}

	#content-1 {
		height: 800px;
		font-size: 8rem;
		color: #fff;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	#content-2 {
		height: 800px;
		color: #fff;
		text-align: center;
		max-width: 1000px;
		margin: auto;
	}

	#content-3 {
		height: 800px;
	}

	#content-4 {
		height: 800px;
	}


	#embedded-viewer-container {
		overflow: hidden;
	}
	#embedded-viewer {
		width: 80%;
		height: 700px;
		position: relative;
		top: -3rem;
		margin: 0 0 -3rem 20px;
	}

	#gif {
		margin-top: 200px;
		text-align: center;
	}

</style>