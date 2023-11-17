<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { AddAlt } from "carbon-icons-svelte";
	import type { ItemInterface } from "$lib/components/interfaces";

	export let item: ItemInterface;

	const dispatch = createEventDispatcher();
	
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="step-container">
	<div class="step-image" style="background-image:url('{item.image}')" on:click={() => dispatch("select")}></div>
	<div class="step-title">
		{String(item.index + 1).padStart(2, '0')}. {item.title}
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
		filter: grayscale(0.6);
		transition: 0.6s;
	}

	.step-image:hover {
		filter: grayscale(0) saturate(1.2);
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