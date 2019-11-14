import { Channel, Client, TextChannel, Util } from 'discord.js';
import { Colors } from 'klasa';
import { Events } from '../../types/Enums';
import { UserCache } from './UserCache';

export class CacheManager {

	public readonly client!: Client;
	public users: UserCache = new UserCache(this);
	private readonly header = new Colors({ text: 'lightblue' }).format('[MEMORY CLEANUP]');
	private ready = false;


	public constructor(client: Client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public clean(init = false): void {
		const [presences, guildMembers, users, emojis, lastMessages] = init ? this._init() : this._clean();

		this.client.emit(Events.Verbose,
			`${this.header} ${
				CacheManager.setColor(presences)} [Presence]s | ${
				CacheManager.setColor(guildMembers)} [GuildMember]s | ${
				CacheManager.setColor(users)} [User]s | ${
				CacheManager.setColor(emojis)} [Emoji]s${lastMessages ? ` | ${CacheManager.setColor(lastMessages)} [Last Message]s.` : '.'}`);
	}

	private _clean(): readonly [number, number, number, number, number] {
		if (!this.ready) throw new Error('Cannot clean uninitialized CacheManager.');
		const OLD_SNOWFLAKE = Util.binaryToID(((Date.now() - CacheManager.THRESHOLD) - CacheManager.EPOCH).toString(2).padStart(42, '0') + CacheManager.EMPTY);

		let presences = 0;
		let guildMembers = 0;
		let emojis = 0;
		let lastMessages = 0;
		let users = 0;

		for (const guild of this.client.guilds.values()) {
			presences += guild.presences.size;
			guild.presences.clear();

			const { me } = guild;
			for (const [id, member] of guild.members) {
				if (member === me) continue;
				if (member.voice.channelID) continue;
				if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
				guild.members.delete(id);
				guildMembers++;
			}

			emojis += guild.emojis.size;
			guild.emojis.clear();
		}

		for (const channel of this.client.channels.values()) {
			if (CacheManager.isTextChannel(channel) && channel.lastMessageID) {
				channel.lastMessageID = null;
				lastMessages++;
			}
		}

		for (const user of this.client.users.values()) {
			if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
			this.client.users.delete(user.id);
			users++;
		}

		return [presences, guildMembers, users, emojis, lastMessages] as const;
	}

	private _init(): readonly [number, number, number, number] {
		if (this.ready) {
			throw new Error('Cannot reinitialize CacheManager.');
		} else {
			this.ready = true;
			this.client.emit(Events.Verbose, `${this.header} Running initial sweep...`);
		}

		const users = this.client.users.size;
		let presences = 0;
		let guildMembers = 0;
		let emojis = 0;

		for (const user of this.client.users.values()) {
		    this.users.create(user);
		}

		this.client.users.clear();
		for (const guild of this.client.guilds.values()) {
			const { me } = guild;

			for (const member of guild.members.values()) {
				guild.memberSnowflakes.add(member.id);
			}

			guildMembers += guild.members.size - 1;
			presences += guild.presences.size;
			emojis += guild.emojis.size;

			guild.presences.clear();
			guild.emojis.clear();

			guild.members.clear();
			if (me) guild.members.set(me.id, me);
		}

		return [presences, guildMembers, users, emojis] as const;

	}

	private static colors = {
		red: new Colors({ text: 'lightred' }),
		yellow: new Colors({ text: 'lightyellow' }),
		green: new Colors({ text: 'green' })
	} as const;

	private static readonly THRESHOLD = 1000 * 60 * 30;

	private static EPOCH = 1420070400000 as const;

	private static EMPTY = '0000100000000000000000' as const;

	private static setColor(n: number): string {
		const text = String(n).padStart(5, ' ');

		if (n > 1000) return CacheManager.colors.red.format(text);
		if (n > 100) return CacheManager.colors.yellow.format(text);
		return CacheManager.colors.green.format(text);
	}

	private static isTextChannel(channel: Channel): channel is TextChannel {
		return channel.type === 'text';
	}

}
