export interface ItemInterface {
	index: number,
	title: string,
	content: string,
	components: Array<
		{
			subtitle: string,
			text: string,
			icon: string
		}
	>
	persons: Array<string>,
	image: string,
}

export interface IPhase {
	phase: string,
	description: string,
	blocks: Array<ItemInterface>
}