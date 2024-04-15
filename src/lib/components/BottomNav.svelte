<script lang="ts">
	import type { IPhase, ItemInterface } from "$lib/components/interfaces";
    import { getBlock, getBlockIndex } from "$lib/utils";
    import type { Writable } from "svelte/store";

	export let selectedItem: Writable<ItemInterface | undefined>;
	export let config: { phases: Array<IPhase>};

	$: itemIndex = getBlockIndex(config, $selectedItem);
	$: prevBlock = getBlock(config, itemIndex - 1);
	$: nextBlock = getBlock(config, itemIndex + 1);

</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bottom-nav">
	<div class="bottom-nav-block-container" class:show={prevBlock}>
		{#if prevBlock}
			<div class="bottom-nav-block" on:click={() => selectedItem.set(prevBlock)}>
				<span class="bottom-nav-caret">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112.2 200">
						<path d="M112.2,182.6a17.1,17.1,0,0,1-6,12.9,18.5,18.5,0,0,1-25.5-1.2L5.5,114.1a20.9,20.9,0,0,1,0-28.2L80.7,5.7a18.5,18.5,0,0,1,25.5-1.2A16.9,16.9,0,0,1,107.5,29L41,100l66.5,71A17.2,17.2,0,0,1,112.2,182.6Z"></path> 
					</svg>
				</span>
				<span class="bottom-nav-block-text"> 
					<span>PREVIOUS</span> 
					<span>{prevBlock.title}</span> 
				</span>
			</div>
		{/if}
	</div>
	<div class="bottom-nav-block-container" class:show={nextBlock}> 
		{#if nextBlock}
			<div class="bottom-nav-block next-post" on:click={() => selectedItem.set(nextBlock)}>
				<span class="bottom-nav-block-text">
					<span>NEXT</span>
					<span>{nextBlock.title}</span>
				</span> 
				<span class="bottom-nav-caret"> 
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112.2 200">
						<path d="M0,17.4A16.8,16.8,0,0,1,6,4.5,18.5,18.5,0,0,1,31.5,5.7l75.1,80.2a20.7,20.7,0,0,1,0,28.2L31.5,194.3A18.5,18.5,0,0,1,6,195.5,16.9,16.9,0,0,1,4.6,171l66.6-71L4.6,29A17.1,17.1,0,0,1,0,17.4Z"></path> 
					</svg> 
				</span> 
			</div>
		{/if}
	</div>
</div>


<style>

	.bottom-nav {
		position: fixed;
		width: 100%;
		bottom: 0;
		left: 0;
		display: flex;
		justify-content: space-between;
		z-index: 5;
	}
	.bottom-nav-block-container {
		width: calc(50% - (1px / 2));
		width: 300px;
		overflow: hidden;
	}
	.bottom-nav-block-container.show {
		cursor: pointer;
	}
	.bottom-nav-block-container.show:hover {
		background-color: #577d89;
		fill: #bae8ff;
	}
	.bottom-nav-block {
		display: flex;
		align-items: center;
		column-gap: 20px;
		transition: background-color 0.3s;
		padding: 6px 10px;
		background-color: rgba(0, 13, 34, 0.8);
		backdrop-filter: blur(10px);
		border-style: solid;
		border-color:  #577d89;
		border-width: 1px 1px 0 0;
		border-radius: 0 3px 0 0;
	}
	.next-post {
		justify-content: flex-end;
		text-align: right;
		border-width: 1px 0 0 1px;
		border-radius: 3px 0 0 0;
	}
	
	.bottom-nav-caret {
		fill: #bae8ff;
		display: flex;
		align-items: center;
	}
	.bottom-nav-caret svg {
		display: inline-block;
		width: 10px;
	}

	.bottom-nav-block-text {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-size: 12px;
	}
	.bottom-nav-block-text span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

</style>