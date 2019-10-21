import { Client } from 'klasa';
import { ClientSettings } from '../settings/ClientSettings';

export default Client.defaultClientSchema
	.add(ClientSettings.Owners, 'User', { array: true });
