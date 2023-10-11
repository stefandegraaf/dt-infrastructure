<script lang="ts">
    import { Button, Modal } from "carbon-components-svelte";
	import type { ItemInterface } from "$lib/components/interfaces";

	export let selectedItem: ItemInterface | undefined;

</script>



	<div class="modal-container" class:modal-open={selectedItem !== undefined}>
		<Modal
			open={selectedItem !== undefined}
			modalHeading={"title"}
			primaryButtonText={"Sluiten"}
			preventCloseOnClickOutside={false}
			size="lg"
			on:close={() => selectedItem = undefined}
		>
			Hello!!!
			<Button kind="primary" on:click={() => selectedItem = undefined}>Close</Button>
		</Modal>
		
	</div>



 <style>

	.modal-container {
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		background-color: transparent;
		z-index: 999;
		transition: background-color 0.4s ease-in-out;
	}

	.modal-container.modal-open {
		position: fixed;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(5px);
	}

 </style>