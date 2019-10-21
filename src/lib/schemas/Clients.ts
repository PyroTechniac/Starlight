import { Client } from 'klasa';

export default Client.defaultClientSchema
	.add('owners', 'User', { array: true })
	.add('commandUses', 'Integer', { 'default': 0, 'configurable': false });
