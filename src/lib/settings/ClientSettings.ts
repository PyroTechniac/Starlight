import { T } from './Shared';

/* eslint-disable @typescript-eslint/no-namespace */

interface RawScheduledTask<D = Record<string, unknown>> {
	id: string;
	taskName: string;
	time: number;
	catchUp: boolean;
	data: D;
	repeat: string;
}

export namespace ClientSettings {
	export const UserBlacklist = T<readonly string[]>('userBlacklist');
	export const GuildBlacklist = T<readonly string[]>('guildBlacklist');
	export const Schedules = T<readonly RawScheduledTask[]>('schedules');

	export const CommandUses = T<number>('commandUses');
	export const LastCommand = T<string>('lastCommand');
}
