/* eslint-disable @typescript-eslint/no-namespace */
import { T } from './Shared';

export namespace UserSettings {
	export const DailyReset = T<number>('daily_reset');
	export namespace BankAccount {
		export const Balance = T<number>('bank_account.balance');
		export const Username = T<string>('bank_account.username');
		export const Password = T<string>('bank_account.password');
	}
}
