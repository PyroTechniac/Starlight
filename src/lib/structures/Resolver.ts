import {
	CategoryChannel,
	Channel,
	Client,
	DMChannel,
	Guild,
	GuildChannel,
	GuildEmoji,
	GuildMember,
	Invite,
	Message,
	NewsChannel,
	Role,
	Snowflake,
	StoreChannel,
	TextChannel,
	User,
	VoiceChannel
} from 'discord.js';
import {
	Argument,
	Command,
	Event,
	Extendable,
	Finalizer,
	Inhibitor,
	Language,
	MentionRegex,
	Monitor,
	Piece,
	Provider,
	Serializer,
	Task
} from 'klasa';
import { noop } from '../util/Utils';
import { parse, URL } from 'url';
import { Readable } from 'stream';
import { resolve } from 'path';
import { readFile, stat } from 'fs-nextra';

export class Resolver {

	public constructor(public client: Client) {
	}

	public async message(msg: Message | Snowflake, channel: TextChannel | DMChannel): Promise<Message | null> {
		if (msg instanceof Message) return msg;
		return Resolver.regex.snowflake.test(msg) ? channel.messages.fetch(msg).catch(noop) : null;
	}

	public async user(user: User | GuildMember | Message | Guild | Snowflake): Promise<User | null> {
		if (user instanceof User) return user;
		if (user instanceof GuildMember) return user.user;
		if (user instanceof Guild) return user.owner?.user ?? null;
		if (user instanceof Message) return user.author;
		if (typeof user === 'string' && Resolver.regex.userOrMember.test(user)) {
			return this.client.users.fetch(Resolver.regex.userOrMember.exec(user)![1]).catch(noop);
		}
		return null;
	}

	public async member(member: GuildMember | User | Snowflake, guild: Guild): Promise<null | GuildMember> {
		if (member instanceof GuildMember) return member;
		if (member instanceof User) return guild.members.fetch(member).catch(noop);
		if (typeof member === 'string' && Resolver.regex.userOrMember.test(member)) {
			const user = await this.client.users.fetch(member).catch(noop);
			return user ? guild.members.fetch(user).catch(noop) : null;
		}
		return null;
	}

	public channel(channel: Channel | Snowflake): Promise<Channel | null> {
		if (channel instanceof Channel) return Promise.resolve(channel);
		if (typeof channel === 'string' && Resolver.regex.channel.test(channel)) {
			return Promise.resolve(this.client.channels.get(Resolver.regex.channel.exec(channel)![1]) ?? null);
		}
		return Promise.resolve(null);
	}

	public guild(guild: Guild | GuildChannel | GuildMember | Role | GuildEmoji | Message | Invite | Snowflake): Promise<Guild | null> {
		if (guild instanceof Guild) return Promise.resolve(guild);
		if (guild instanceof GuildChannel
			|| guild instanceof GuildMember
			|| guild instanceof Role
			|| guild instanceof GuildEmoji
			|| guild instanceof Invite
			|| guild instanceof Message) return Promise.resolve(guild.guild);
		if (typeof guild === 'string' && Resolver.regex.snowflake.test(guild)) {
			return Promise.resolve(this.client.guilds.get(Resolver.regex.snowflake.exec(guild)![1]) ?? null);
		}

		return Promise.resolve(null);
	}

	public async role(role: Role | Snowflake, guild: Guild): Promise<Role | null> {
		if (role instanceof Role) return role;
		if (typeof role === 'string' && Resolver.regex.role.test(role)) {
			return guild.roles.fetch(Resolver.regex.role.exec(role)![1]).catch(noop);
		}
		return null;
	}

	public boolean(bool: boolean | string): Promise<boolean | null> {
		if (typeof bool === 'boolean') return Promise.resolve(bool);
		if (['1', 'true', '+', 't', 'yes', 'y'].includes(bool.toLowerCase())) return Promise.resolve(true);
		if (['0', 'false', '-', 'f', 'no', 'n'].includes(bool.toLowerCase())) return Promise.resolve(false);
		return Promise.resolve(null);
	}

	public string(data: unknown): Promise<string> {
		return Promise.resolve(String(data));
	}

	public integer(int: string | number): Promise<number | null> {
		if (typeof int === 'number' && Number.isInteger(int)) return Promise.resolve(int);
		const parsed = Number.parseInt(int as string, 10);
		if (Number.isNaN(parsed)) return Promise.resolve(null);
		return Promise.resolve(parsed);
	}

	public float(f: number | string): Promise<number | null> {
		if (typeof f === 'number' && !Number.isNaN(f)) return Promise.resolve(f);
		const parsed = Number.parseFloat(f as string);
		if (Number.isNaN(parsed)) return Promise.resolve(null);
		return Promise.resolve(parsed);
	}

	public url(hyperlink: URL | string): Promise<string | null> {
		const parsed = parse(hyperlink.toString());
		if (parsed.protocol && parsed.hostname) return Promise.resolve(hyperlink.toString());
		return Promise.resolve(null);
	}

	public async textChannel(channel: Channel | Snowflake): Promise<TextChannel | null> {
		const parsed = await this.channel(channel);
		if (!parsed) return null;
		return this._checkChannel(parsed, 'text');
	}

	public async voiceChannel(channel: Channel | Snowflake): Promise<VoiceChannel | null> {
		const parsed = await this.channel(channel);
		if (!parsed) return null;
		return this._checkChannel(parsed, 'voice');
	}

	public async dmChannel(channel: Channel | Snowflake): Promise<DMChannel | null> {
		const parsed = await this.channel(channel);
		if (!parsed) return null;
		return this._checkChannel(parsed, 'dm');
	}

	public async categoryChannel(channel: Channel | Snowflake): Promise<CategoryChannel | null> {
		const parsed = await this.channel(channel);
		if (!parsed) return null;
		return this._checkChannel(parsed, 'category');
	}

	public async newsChannel(channel: Channel | Snowflake): Promise<NewsChannel | null> {
		const parsed = await this.channel(channel);
		if (!parsed) return null;
		return this._checkChannel(parsed, 'news');
	}

	public async storeChannel(channel: Channel | Snowflake): Promise<StoreChannel | null> {
		const parsed = await this.channel(channel);
		if (!parsed) return null;
		return this._checkChannel(parsed, 'store');
	}

	public async guildChannel(channel: Channel | Snowflake): Promise<GuildChannel | null> {
		const parsed = await this.channel(channel);
		if (!parsed) return null;
		return this._checkChannel(parsed, 'guild');
	}

	public piece(data: string | Piece, type: 'argument'): Promise<Argument | null>;
	public piece(data: string | Piece, type: 'command'): Promise<Command | null>;
	public piece(data: string | Piece, type: 'event'): Promise<Event | null>;
	public piece(data: string | Piece, type: 'extendable'): Promise<Extendable | null>;
	public piece(data: string | Piece, type: 'finalizer'): Promise<Finalizer | null>;
	public piece(data: string | Piece, type: 'inhibitor'): Promise<Inhibitor | null>;
	public piece(data: string | Piece, type: 'language'): Promise<Language | null>;
	public piece(data: string | Piece, type: 'monitor'): Promise<Monitor | null>;
	public piece(data: string | Piece, type: 'provider'): Promise<Provider | null>;
	public piece(data: string | Piece, type: 'serializer'): Promise<Serializer | null>;
	public piece(data: string | Piece, type: 'task'): Promise<Task | null>;
	public piece(data: string | Piece, type: 'argument' | 'command' | 'event' | 'extendable' | 'finalizer' | 'inhibitor' | 'language' | 'monitor' | 'provider' | 'serializer' | 'task'): Promise<Argument | Command | Event | Extendable | Finalizer | Inhibitor | Language | Monitor | Provider | Serializer | Task | null> {
		if (typeof data === 'string') {
			for (const store of this.client.pieceStores.values()) {
				const pce = store.get(data);
				if (pce) return Promise.resolve(pce.type === type ? pce : null);
			}
			return Promise.resolve(null);
		}

		return Promise.resolve(data.type === type ? data as Argument | Command | Event | Extendable | Finalizer | Inhibitor | Language | Monitor | Provider | Serializer | Task : null);
	}

	public async buffer(resource: Buffer | Readable | string): Promise<Buffer | null> {
		if (Buffer.isBuffer(resource)) return resource;

		if (typeof resource === 'string') {
			if (/^https?:\/\//.test(resource)) {
				return this.client.cdn
					.url(resource)
					.type('Buffer')
					.get<Buffer>()
					.catch(noop);
			}
			const file = resolve(resource);
			const stats = await stat(file).catch(noop);
			if (!stats?.isFile()) return null;
			return readFile(file).catch(noop);

		}
		const data: Buffer[] = [];
		for await (const buf of resource) data.push(buf);
		return Buffer.concat(data);

	}

	private _checkChannel(channel: Channel, type: 'dm'): DMChannel | null;
	private _checkChannel(channel: Channel, type: 'text'): TextChannel | null;
	private _checkChannel(channel: Channel, type: 'category'): CategoryChannel | null;
	private _checkChannel(channel: Channel, type: 'news'): NewsChannel | null;
	private _checkChannel(channel: Channel, type: 'store'): StoreChannel | null;
	private _checkChannel(channel: Channel, type: 'voice'): VoiceChannel | null;
	private _checkChannel(channel: Channel, type: 'guild'): GuildChannel | null;
	private _checkChannel(channel: Channel, type: 'dm' | 'text' | 'category' | 'news' | 'store' | 'voice' | 'guild'): DMChannel | TextChannel | CategoryChannel | NewsChannel | StoreChannel | VoiceChannel | GuildChannel | null {
		if (type === 'guild') return 'guild' in channel ? channel as GuildChannel : null;
		return channel.type === type ? channel as DMChannel | TextChannel | CategoryChannel | NewsChannel | StoreChannel | VoiceChannel : null;
	}

	public static regex: MentionRegex = {
		userOrMember: /^(?:<@!?)?(\d{17,19})>?$/,
		channel: /^(?:<#)?(\d{17,19})>?$/,
		emoji: /^(?:<a?:\w{2,32}:)?(\d{17,19})>?$/,
		role: /^(?:<@&)?(\d{17,19})>?$/,
		snowflake: /^(\d{17,19})$/
	};

}
