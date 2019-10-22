import { Client } from 'klasa';
import { UserSettings } from '../settings/UserSettings';

export default Client.defaultUserSchema
    .add(UserSettings.Money, 'Float', { default: 0, min: 0, max: 2147483647, configurable: false });