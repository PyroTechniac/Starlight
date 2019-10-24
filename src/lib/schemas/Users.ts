import { Client } from 'klasa';
import { UserSettings } from '../settings/UserSettings';

export default Client.defaultUserSchema
	.add(UserSettings.Money, 'Integer', { 'default': 0, 'min': 0, 'configurable': false })
	.add(UserSettings.DailyReset, 'Integer', { default: 0, configurable: false });
