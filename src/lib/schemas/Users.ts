import { Client } from 'klasa';
import { UserSettings } from '../settings/UserSettings';

export default Client.defaultUserSchema
	.add(UserSettings.CommandUses, 'Integer', { 'default': 0, 'configurable': false })
	.add(UserSettings.Points, 'Integer', { 'default': 0, 'configurable': false })
	.add(UserSettings.LastCommand, 'Command', { configurable: false });
