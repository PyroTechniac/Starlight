import { Client } from 'klasa';
import { ClientSettings } from '../settings/ClientSettings';

export default Client.defaultClientSchema
	.add(ClientSettings.CommandUses, 'Integer', { 'default': 0, configurable: false });
