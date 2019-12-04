import { T } from './Shared';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace GuildSettings {
	export const Prefix = T<string>('prefix');
	export const CommandUses = T<number>('commandUses');
	export const Tags = T<readonly [string, string][]>('tags');
	export namespace Roles {
		export const Admin = T<string>('roles.admin');
		export const Staff = T<string>('roles.staff');
		export const Moderator = T<string>('roles.moderator');
	}
}
