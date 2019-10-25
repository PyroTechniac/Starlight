import { Client } from 'klasa';
import { UserSettings } from '../settings/UserSettings';

export default Client.defaultUserSchema
	.add(UserSettings.Color, 'Number', { 'default': 0, 'min': 0, 'max': 0xFFFFFF });
