import { User, Client } from 'discord.js';
import { Settings } from 'klasa';
import { UserSettings } from '../settings/UserSettings';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export class BankAccount {

	public readonly user!: User;

	public authenticated = false;

	public constructor(user: User) {
		Object.defineProperty(this, 'user', { value: user });
	}

	public get client(): Client {
		return this.user.client;
	}

	public get settings(): Settings {
		return this.user.settings;
	}

	public get balance(): number {
		return this.settings.get(UserSettings.BankAccount.Balance);
	}

	public async init(): Promise<this> {
		const { settings } = this;

		await settings.sync();

		return this;
	}

	public async create(username: string, password: string): Promise<this> {
		const { settings } = this;
		const secret = `${this.user.id}-${this.user.createdTimestamp}`;
		const encrypted = [BankAccount.encrypt(username, secret), BankAccount.encrypt(password, secret)];

		await settings.sync();

		await settings.update([[UserSettings.BankAccount.Username, encrypted[0]], [UserSettings.BankAccount.Password, encrypted[1]]]);

		return this;
	}

	public async verify(username: string, password: string): Promise<boolean> {
		const { settings } = this;
		const secret = `${this.user.id}-${this.user.createdTimestamp}`;
		await settings.sync();
		const encryptedUsername = settings.get(UserSettings.BankAccount.Username);
		const encryptedPassword = settings.get(UserSettings.BankAccount.Password);

		const decryptedUsername = BankAccount.decrypt(encryptedUsername, secret);
		const decryptedPassword = BankAccount.decrypt(encryptedPassword, secret);

		return (decryptedUsername === username && decryptedPassword === password);
	}

	public async authenticate(username: string, password: string): Promise<this> {
		const authenticated = await this.verify(username, password);

		if (!authenticated) throw 'Invalid login details were provided.';

		this.authenticated = true;

		return this;
	}

	public logout(): this {
		this.authenticated = false;

		return this;
	}

	public static encrypt(data: any, secret: string): string {
		const iv = randomBytes(1024);
		const cipher = createCipheriv('aes-256-cbc', secret, iv);
		return `${cipher.update(JSON.stringify(data), 'utf8', 'base64') + cipher.final('base64')}.${iv.toString('base64')}`;
	}

	public static decrypt(token: string, secret: string): any {
		const [data, iv] = token.split('.');
		const decipher = createDecipheriv('aes-256-cbc', secret, Buffer.from(iv, 'base64'));
		return JSON.parse(decipher.update(data, 'base64', 'utf8') + decipher.final('utf8'));
	}

}
