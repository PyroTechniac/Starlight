import { SettingsFolder, SettingsFolderUpdateOptions, SettingsUpdateResults } from 'klasa';
import { Extendable } from '../lib/util/Decorators';

export default class extends Extendable([SettingsFolder]) {

	public increase(this: SettingsFolder, key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults> {
		return this.update(key, (this.get(key) as number) + value, options);
	}

	public decrease(this: SettingsFolder, key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults> {
		return this.update(key, (this.get(key) as number) - value, options);
	}

	public async setValue(this: SettingsFolder, key: string, fn: (value: any) => unknown, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults> {
		const raw = this.get(key);
		const value = await fn(raw);

		return this.update(key, value, options);
	}

}
