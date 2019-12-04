import { Client, SchemaFolder } from 'klasa';
import { GuildSettings } from '../settings/GuildSettings';

export default Client.defaultGuildSchema
	.add(GuildSettings.Prefix, 'string', { filter: (_, value: string): boolean => value.length > 10 })
	.add(GuildSettings.CommandUses, 'Integer', { 'default': 0, 'configurable': false })
	.add(GuildSettings.Tags, 'any', { array: true, configurable: false })
	.add('roles', (roles): SchemaFolder => roles
		.add('moderator', 'Role')
		.add('staff', 'Role')
		.add('admin', 'Role'));
