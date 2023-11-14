<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { AddAlt } from "carbon-icons-svelte";
	import type { ItemInterface } from "$lib/components/interfaces";

	export let item: ItemInterface;
	export let index: number;


	const dispatch = createEventDispatcher();
	
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="step-container">
	<div class="step-image" style="background-image:url('{item.image}')" on:click={() => dispatch("select")}></div>
	<div class="step-title">
		{index}. {item.title}
	</div>
	<div class="step-sub" on:click={() => dispatch("select")}>
		More info 
		<AddAlt  
			color="var(--dark-main)" 
			size={16}
		/>
	</div>
</div>



<style>

	.step-container {
		width: calc(33% - 50px);
	}
	.step-image {
		background-size: cover;
		background-position: center;
		height: 260px;
		width: 100%;
		cursor: pointer;
		transition: 0.3s;
		filter: grayscale(50%);
	}

	.step-image:hover {
		filter: brightness(1);
	}

	.step-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 10px;
	}
	.step-sub {
		display: flex;
		column-gap: 6px;
		align-items: center;
		margin-top: 10px;
		cursor: pointer;
		color: var(--dark-main);
	}

</style>