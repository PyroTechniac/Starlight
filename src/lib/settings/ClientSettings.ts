/* eslint-disable @typescript-eslint/no-namespace */

interface RawScheduledTask<T = Record<string, any>> {
	id: string;
	taskName: string;
	time: number;
	catchUp: boolean;
	data: T;
	repeat: string;
}

export namespace ClientSettings {
	export type UserBlacklist = string[];
	export const UserBlacklist = 'userBlacklist';
	export type GuildBlacklist = string[];
	export const GuildBlacklist = 'guildBlacklist';
	export type Schedules = readonly RawScheduledTask[];
	export const Schedules = 'schedules';

	export type Owners = string[];
	export const Owners = 'owners';
}
