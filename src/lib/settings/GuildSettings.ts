import { T } from './Shared';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace GuildSettings {
	export const Prefix = T<string>('prefix');
	export const Owner = T<string>('owner');
	export const CommandUses = T<number>('command_uses');
}
