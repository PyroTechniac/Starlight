import { Client, SchemaFolder } from 'klasa';
import { UserSettings } from '../settings/UserSettings';

export default Client.defaultUserSchema
	.add(UserSettings.DailyReset, 'Integer', { default: 0, configurable: false })
	.add('bank_account', (folder): SchemaFolder => folder
		.add('balance', 'Integer', { default: 0, min: 0, configurable: false })
		.add('username', 'String', { configurable: false })
		.add('password', 'String', { configurable: false })
	);
