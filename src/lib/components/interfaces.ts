export interface ItemInterface {
	title: string,
	content: string,
	components: [
		{
			subtitle: string,
			text: string,
			icon: string
		}
	]
	persons: Array<string>,
	image: string,
}