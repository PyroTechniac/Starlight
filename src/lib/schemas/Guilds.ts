import { Client } from 'klasa';
import { GuildSettings } from '../settings/GuildSettings';

export default Client.defaultGuildSchema
	.add(GuildSettings.Prefix, 'string', { filter: (_, value: string): boolean => value.length > 10 })
	.add(GuildSettings.Owner, 'User', { configurable: false })
	.add(GuildSettings.StreamChannel, 'TextChannel')
	.add(GuildSettings.Streams, 'String', { array: true });
