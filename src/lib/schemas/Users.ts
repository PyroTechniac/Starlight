import { Client } from 'klasa';
import { UserSettings } from '../settings/UserSettings';

export default Client.defaultUserSchema
	.add(UserSettings.CommandUses, 'Integer', { 'default': 0, configurable: false });
