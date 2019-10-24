/* eslint-disable @typescript-eslint/no-namespace */
import { T } from './Shared';

export namespace UserSettings {
	export const Money = T<number>('money');
	export const DailyReset = T<number>('daily_reset');
}
