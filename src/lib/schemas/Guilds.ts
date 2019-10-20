import { Client } from 'klasa';

export default Client.defaultGuildSchema
	.add('prefix', 'string', { filter: (_, value: string): boolean => value.length > 10 })
	.add('owner', 'User', { configurable: false })
	.add('commandUses', 'Integer', { default: 0, configurable: false });