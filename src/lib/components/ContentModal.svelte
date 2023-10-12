<script lang="ts">
    import { Modal } from "carbon-components-svelte";
	import type { ItemInterface } from "$lib/components/interfaces";

	export let selectedItem: ItemInterface | undefined;

</script>



<div class="modal-container" class:modal-open={selectedItem !== undefined}>
	{#if selectedItem}
	<Modal
		open={selectedItem !== undefined}
		modalHeading={selectedItem?.title}
		primaryButtonText={"Back to overview"}
		preventCloseOnClickOutside={false}
		size="lg"
		on:click:button--primary={() => selectedItem = undefined}
		on:close={() => selectedItem = undefined}
	>
		<div class="modal-inner">
			<div class="modal-content">
				{@html selectedItem?.content}
			</div>
			<div class="modal-info">
				<div class="modal-info-persons">
					{#each selectedItem?.persons as person}
					<div class="modal-info-person">
						<img class="person-image" src="https://secure.gravatar.com/avatar/51a6f4a083cd24d0ac88aacd90e31f1c?s=800&d=identicon" alt="img"/>
						<div class="modal-info-person-name">{person}</div>
					</div>
					{/each}
				</div>
			</div>
		</div>
	</Modal>
	{/if}
</div>



 <style>

	.modal-container {
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		background-color: transparent;
		z-index: 999;
		transition: background-color 0.4s;
	}

	.modal-container.modal-open {
		position: fixed;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(5px);
	}

	.modal-inner {
		display: grid;
		grid-template-columns: 3fr 2fr;
		column-gap: 50px;
	}

	.person-image {
		width: 30px;
		height: 30px;
	}

 </style>