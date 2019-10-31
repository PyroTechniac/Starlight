import { Client } from 'klasa';
import { UserSettings } from '../settings/UserSettings';

export default Client.defaultUserSchema
	.add(UserSettings.CommandUses, 'Integer', { 'default': 0 })
	.add(UserSettings.Color, 'Integer', { 'default': 0, 'min': 0, 'max': 0xFFFFFF, 'configurable': false })
	.add(UserSettings.Points, 'Number', { 'default': 0, 'min': 0, 'configurable': false });
