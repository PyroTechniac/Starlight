import { T } from './Shared';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace GuildSettings {
	export const Prefix = T<string>('prefix');
	export const CommandUses = T<number>('commandUses');
	export const Tags = T<readonly [string, string][]>('tags');
}
