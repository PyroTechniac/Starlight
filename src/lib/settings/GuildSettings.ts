import { T } from './Shared';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace GuildSettings {
	export const Prefix = T<string>('prefix');
	export const Owner = T<string>('owner');

	export const StreamChannel = T<string>('stream_channel');
	export const Streams = T<readonly string[]>('streams');
}
