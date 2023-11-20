export interface ItemInterface {
	index: number,
	phase: string,
	title: string,
	content: string,
	components: Array<
		{
			subtitle: string,
			text: string,
			icon: string
		}
	>,
	contentAfter: string,
	persons: Array<string>,
	image: string,
}

export interface IPhase {
	phase: string,
	blocks: Array<ItemInterface>
}