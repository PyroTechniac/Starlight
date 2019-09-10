import { ModLogJSON } from '../types';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace GuildSettings {
	export type Prefix = string;
	export const Prefix = 'prefix';

	export type ModLogs = ModLogJSON[];
	export const ModLogs = 'modlogs';

	export namespace Channels {
		export type ModLog = string;
		export const ModLog = 'channels.modlog';
	}
}
