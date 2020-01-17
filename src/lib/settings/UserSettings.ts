import { T } from './Shared';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace UserSettings {
	export const CommandUses = T<number>('commandUses');
	export const Points = T<number>('Points');
	export const LastCommand = T<string>('lastCommand');
}
