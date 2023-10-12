export interface ItemInterface {
	title: string,
	content: [
		{
			subtitle: string,
			text: string,
			icon: string
		}
	]
	persons: Array<string>,
	image: string,
}