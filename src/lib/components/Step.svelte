<script lang="ts">

	interface Step {
		title: string;
		content: string;
		image: string;
	}

	export let step: Step;
	export let index: number;
	
</script>


<div class="step-container">
	<div class="step-image" style="background-image:url('{step.image}')"></div>
	<div class="step-title">
		0{index + 1}. {step.title}
	</div>
</div>



<style>

	.step-image {
		background-size: cover;
		background-position: center;
		height: 200px;
		width: 100%;
	}

	.step-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 10px;
	}

</style>