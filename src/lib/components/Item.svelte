<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { ItemInterface } from "$lib/components/interfaces";

	export let item: ItemInterface;
	export let index: number;


	const dispatch = createEventDispatcher();
	
</script>


<div class="step-container">
	<div class="step-image" style="background-image:url('{item.image}')" on:click={() => dispatch("select")}></div>
	<div class="step-title">
		0{index + 1}. {item.title}
	</div>
</div>



<style>

	.step-image {
		background-size: cover;
		background-position: center;
		height: 260px;
		width: 100%;
		cursor: pointer;
	}

	.step-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 10px;
	}

</style>