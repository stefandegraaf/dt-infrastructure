import type { IPhase, ItemInterface } from "./components/interfaces";

export function getBlockIndex(config: any, block: ItemInterface | undefined): number {
	const configFlat = config.phases.flatMap((phase: IPhase) => phase.blocks);
	return configFlat.findIndex((item: ItemInterface) => item === block);
}

export function getBlock(config: any, index: number): ItemInterface | undefined {
	const configFlat = config.phases.flatMap((phase: IPhase) => phase.blocks);
	return configFlat[index] ?? undefined;
}