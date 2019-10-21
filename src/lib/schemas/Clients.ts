import { Client } from 'klasa';

export default Client.defaultClientSchema
	.add('owners', 'User', { array: true });
