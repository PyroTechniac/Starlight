import { Client } from 'klasa';
import { GuildSettings } from '../settings/GuildSettings';

export default Client.defaultGuildSchema
	.add(GuildSettings.Prefix, 'string', { filter: (_, value: unknown): boolean => typeof value === 'string' ? value.length > 10 : false })
	.add(GuildSettings.CommandUses, 'Integer', { 'default': 0, 'configurable': false })
	.add(GuildSettings.Tags, 'any', { array: true, configurable: false });
