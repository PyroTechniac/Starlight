import { SettingsFolder, SettingsFolderUpdateOptions, SettingsUpdateResults } from 'klasa';
import { Extendable } from '../lib/util/Decorators';
import { CustomGet } from '../lib/settings/Shared';

export default class extends Extendable([SettingsFolder]) {

	/* eslint-disable @typescript-eslint/restrict-plus-operands */
	public increase<K extends string>(key: CustomGet<K, number>, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;
	public increase(this: SettingsFolder, key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults> {
		return this.setValue(key, (val): number => val + value, options);
	}

	public decrease<K extends string>(key: CustomGet<K, number>, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;
	public decrease(this: SettingsFolder, key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults> {
		return this.setValue(key, (val): number => val + value, options);
	}
	/* eslint-enable @typescript-eslint/restrict-plus-operands */

	public async setValue<K extends string, V>(key: CustomGet<K, V>, fn: (value: V) => V | Promise<V>, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;
	public async setValue(this: SettingsFolder, key: string, fn: (value: any) => unknown, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults> {
		const raw = this.get(key);
		const value = await fn(raw);

		return this.update(key, value, options);
	}

}
