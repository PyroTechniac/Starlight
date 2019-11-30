import { BitField } from 'discord.js';

export class UserFlags extends BitField<UserFlagsString> {

	public static FLAGS: Record<UserFlagsString, number> = {
		NONE: 0,
		DISCORD_EMPLOYEE: 1 << 0,
		DISCORD_PARTNER: 1 << 1,
		HYPESQUAD_EVENTS: 1 << 2,
		BUG_HUNTER: 1 << 3,
		HOUSE_BRAVERY: 1 << 6,
		HOUSE_BALANCE: 1 << 7,
		HOUSE_BRILLIANCE: 1 << 8,
		EARLY_SUPPORTER: 1 << 9,
		TEAM_USER: 1 << 10,
		SYSTEM: 1 << 12
	};

}

export type UserFlagsString = 'NONE'
| 'DISCORD_EMPLOYEE'
| 'DISCORD_PARTNER'
| 'HYPESQUAD_EVENTS'
| 'BUG_HUNTER'
| 'HOUSE_BRAVERY'
| 'HOUSE_BRILLIANCE'
| 'HOUSE_BALANCE'
| 'EARLY_SUPPORTER'
| 'TEAM_USER'
| 'SYSTEM';
