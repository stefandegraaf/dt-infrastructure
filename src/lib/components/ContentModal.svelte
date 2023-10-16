<script lang="ts">
    import { Button, Modal } from "carbon-components-svelte";
	import type { ItemInterface } from "$lib/components/interfaces";
	import { Person, Close, IbmCloudDirectLink_2Connect, Add } from "carbon-icons-svelte";

	export let selectedItem: ItemInterface | undefined;

</script>

{#if selectedItem}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="modal-container">
		<div class="modal-inner modal-text">
			<div class="modal-close-button">
				<Button
					kind="secondary"
					size="lg"
					iconDescription="CloseLarge"
					icon={Close}
					on:click={() => {selectedItem = undefined}}
				/>
			</div>
			<div class="modal-content">
				<div class="modal-header">{selectedItem.title}</div>
				<div class="content-blocks">
					{#each selectedItem.content as block}
						<div class="content-block">	
							<div class="block-icon">
								<IbmCloudDirectLink_2Connect size={32} />
							</div>
							<div class="block-content">
								<div class="block-header">{block.subtitle}</div>
								<div class="block">{block.text}</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="modal-info">
				<div class="modal-info-persons">
					<div class="modal-header-02">Team</div>
					{#each selectedItem?.persons as person}
					<div class="modal-info-person">
						<Person size={32} />
						<div class="modal-info-person-name">{person}</div>
					</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="modal-overlay" class:modal-open={selectedItem !== undefined} on:click={() => {selectedItem = undefined}}></div>
	</div>
{/if}


 <style>

	.modal-container {
		position: fixed;
		width: 100vw;
		height: 100vh;
		left: 0;
		top: 0;
		z-index: 1;
	}
	.modal-overlay {
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		background-color: transparent;
		z-index: 1;
		transition: background-color 0.4s;
	}

	.modal-overlay.modal-open {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(5px);
	}

	.modal-inner {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		height: 80%;
		z-index: 1;
		display: grid;
		grid-template-columns: 3fr 2fr;
		column-gap: 100px;
		background-color: rgba(10, 10, 10, 0.9);
		color: #fff;
		backdrop-filter: blur(5px);
		border-radius: 8px;
		padding: 30px;
	}
	.modal-close-button {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.modal-header {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 60px;
	}
	.modal-header-02 {
		font-size: 1.5rem;
		font-weight: 600;
	}
	.modal-text {
		font-size: 1.1rem;
		font-weight: 300;
		line-height: 1.5;
	}


	.modal-info {
		margin-top: 60px;
	}
	.modal-info-person {
		display: flex;
		align-items: center;
		column-gap: 30px;
		margin-top: 10px;
		
	}
	.person-image {
		width: 30px;
		height: 30px;
	}

	.content-block {
		display: grid;
		grid-template-columns: 100px 1fr;
		align-items: center;
		margin-top: 30px;
	}
	.block-header {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 10px;
	}

 </style>