import { SettingsFolder, SettingsFolderUpdateOptions, SettingsUpdateResults } from 'klasa';
import { Extendable } from '../lib/util/Decorators';

export default class extends Extendable([SettingsFolder]) {

	public increase(this: SettingsFolder, key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults> {
		return this.update(key, (this.get(key) as number) + value, options);
	}

	public decrease(this: SettingsFolder, key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults> {
		return this.update(key, (this.get(key) as number) - value, options);
	}

}
