/* eslint-disable @typescript-eslint/no-namespace */
import { T } from './Shared';

export namespace UserSettings {
	export const Color = T<number>('color');
	export const CommandUses = T<number>('command_uses');
}
