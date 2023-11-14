<script lang="ts">
    import { Button } from "carbon-components-svelte";
	import { Person, Close, IbmCloudDirectLink_2Connect } from "carbon-icons-svelte";

	import type { ItemInterface } from "$lib/components/interfaces";

	export let selectedItem: ItemInterface | undefined;

</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if selectedItem}
	<div class="modal-container">
		<div class="modal-inner modal-text">
			<div class="modal-close-button">
				<Button
					kind="tertiary"
					size="lg"
					iconDescription="Close"
					icon={Close}
					on:click={() => {selectedItem = undefined}}
				/>
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
			<div class="modal-content">
				<div class="modal-header">{selectedItem.title}</div>
				<div class="content-blocks">
					{@html selectedItem.content}
					{#if selectedItem.components}
						{#each selectedItem.components as block}
							<div class="content-block">	
								<div class="block-icon">
								{#if block.icon}
									<img src={block.icon} alt="icon" />
								{:else}
									<IbmCloudDirectLink_2Connect size={32} />
								{/if}
								</div>
								<div class="block-content">
									<div class="block-header">{block.subtitle}</div>
									<div class="block">{@html block.text}</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
		<div class="inner-overlay"></div>
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
		z-index: 2;
		background-color: rgba(0, 17, 43, 0.82);
		color: #fff;
		backdrop-filter: blur(0px);
		border-radius: 8px;
		padding: 50px;
		overflow-x: hidden;
		-ms-overflow-style: none;  /* IE and Edge */
		scrollbar-width: none;  /* Firefox */
	}
	.modal-inner::-webkit-scrollbar {
		display: none;
	}
	.inner-overlay {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		height: 80%;
		opacity: 0.75;
		z-index: 1;
		background-image: url(https://storage.googleapis.com/ahp-research/projects/communicatie/images/render_6-2mb.png);
		background-size: cover;
		background-position: center;
		border-radius: 8px;
	}
	.modal-close-button {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.modal-header {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 30px;
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
	.modal-content {
		max-width: 1100px;
		margin: auto;
	}

	.modal-info {
		margin: 0 40px 30px 30px;
		padding: 8px 20px 15px;
		float: right;
		border-radius: 8px;
		border: 1px solid #fff;
	}
	.modal-info-person {
		display: flex;
		align-items: center;
		column-gap: 30px;
		margin-top: 10px;
		
	}
	
	.content-block {
		display: grid;
		grid-template-columns: 100px 1fr;
		align-items: center;
		margin-top: 30px;
	}
	.block-icon {
		width: 80%;
	}
	.block-icon img {
		width: 100%;
	}
	.block-header {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 10px;
	}

 </style>