import { User, Client } from "discord.js";
import { Settings } from "klasa";
import { UserSettings } from "../settings/UserSettings";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

export class BankAccount {
    public readonly user!: User;

    public authenticated: boolean = false;

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

    public async init() {
        const { settings } = this;

        await settings.sync();
    }

    public async create(username: string, password: string) {
        const { settings } = this;
        const secret = `${this.user.id}-${this.user.createdTimestamp}`;
        const encrypted = [BankAccount.encrypt(username, secret), BankAccount.encrypt(password, secret)];

        await settings.sync();

        await settings.update([[UserSettings.BankAccount.Username, encrypted[0]], [UserSettings.BankAccount.Password, encrypted[1]]]);
    }

    public static encrypt(data: any, secret: string) {
        const iv = randomBytes(16);
        const cipher = createCipheriv('aes-256-cbc', secret, iv);
        return `${cipher.update(JSON.stringify(data), 'utf8', 'base64') + cipher.final('base64')}.${iv.toString('base64')}`;
    }

    public static decrypt(token: string, secret: string) {
        const [data, iv] = token.split('.');
        const decipher = createDecipheriv('aes-256-cbc', secret, Buffer.from(iv, 'base64'));
        return JSON.parse(decipher.update(data, 'base64', 'utf8') + decipher.final('utf8'));
    }
}