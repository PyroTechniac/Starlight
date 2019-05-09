import * as ytdl from 'ytdl-core'
import { download as ytdlDiscord } from 'ytdl-core-discord';
import { promisify } from 'util'
import { KlasaUser, KlasaGuild, KlasaClient, util } from 'klasa';
import { TextChannel, VoiceChannel, VoiceConnection, StreamDispatcher } from 'discord.js';

const { codeBlock } = util
const getInfoAsync = promisify(ytdl.getInfo);

export interface Song {
	url: string;
	title: string;
	user: KlasaUser | string;
	loudness: number;
	seconds: number;
	opus: boolean;
}

export class MusicManager {
	public readonly client!: KlasaClient;
	public readonly guild!: KlasaGuild
	public queue: Song[] = [];
	public recentlyPlayed: string[] = [];
	public channel: TextChannel | null = null;
	private _autoplay: boolean = false;
	private _next: string | null = null;
	public constructor(guild: KlasaGuild) {
		Object.defineProperty(this, 'client', { value: guild.client })

		Object.defineProperty(this, 'guild', { value: guild })
	}

	public get autoplay(): boolean {
		return this._autoplay
	}

	public set autoplay(status: boolean) {
		this._autoplay = status;
	}

	public get remaining(): number | null {
		const { playing, dispatcher } = this;
		if (!playing) return null;
		const [song] = this.queue
		return (song.seconds * 1000) - dispatcher!.streamTime;
	}

	public get next(): string | null {
		return this._next ? `https://youtu.be/${this._next}` : null;
	}

	public get voiceChannel(): VoiceChannel | null {
		return this.guild.me!.voice.channel;
	}

	public get connection(): VoiceConnection | null {
		const { voiceChannel } = this;
		return (voiceChannel && voiceChannel.connection) || null;
	}

	public get dispatcher(): StreamDispatcher | null {
		const { connection } = this;
		return (connection && connection.dispatcher) || null;
	}

	public get playing(): boolean {
		return !this.paused && !this.idling;
	}

	public get paused(): boolean | null {
		const { dispatcher } = this;
		return dispatcher ? dispatcher.paused : null
	}

	public get idling(): boolean {
		return !this.queue.length || !this.dispatcher;
	}

	public join(channel: VoiceChannel): Promise<VoiceConnection | void> {
		return channel.join().catch((err): void => {
			if (String(err).includes('ECONNRESET')) throw `There was an issue connecting to the voice channel, please try again`;
			this.client.emit('error', err);
			throw err;
		})
	}

	public async add(user: KlasaUser, url: string): Promise<Song | null> {
		const song: any = await getInfoAsync(url).catch((err): void => {
			this.client.emit('log', err, 'error')
			throw `Something happened with the YouTube URL: ${url}\n${codeBlock('', err)}`
		})

		const metadata: Song = {
			url: song!.video_id,
			title: song.title.replace(/@(here|everyone)/, `@\u200B$1`),
			user,
			loudness: song.loudness,
			seconds: Number.parseInt(song.length_seconds),
			opus: song.formats.some((format): boolean => format.type === 'audio/webm codecs="opus"')
		}

		this.queue.push(metadata);
		this._next = this.getLink(song.related_videos);

		return metadata;
	}

	public getLink(playlist: Record<string, any>[]): string | null {
		for (const song of playlist) {
			if (!song.id || this.recentlyPlayed.includes(song.id)) continue;
			return song.id;
		}
		return null;
	}

	public async leave(): Promise<this> {
		if (!this.voiceChannel) throw `I'm not in a voice channel`;
		await this.voiceChannel!.leave();
		if (this.voiceChannel) this.forceDisconnect();

		return this.clear();
	}

	public async play(): Promise<StreamDispatcher> {
		if (!this.voiceChannel) throw `I'm not currently in a voice channel`;
		if (!this.connection) {
			await this.channel!.send(`I am not currently connected, let me restart my connection`)
				.catch((error): boolean => this.client.emit('error', error))
			const { voiceChannel } = this;
			this.forceDisconnect();
			await this.join(voiceChannel);
			if (!this.connection) throw `I was unable to connect, please try again later`;
		}
		if (!this.queue.length) throw 'There are no songs for me to play';
		const [song] = this.queue;
		const stream = await ytdlDiscord(`https://youtu.be/${song.url}`)

		this.connection.play(stream, {
			bitrate: this.voiceChannel!.bitrate / 1000,
			passes: 5,
			type: song.opus ? 'opus' : 'unknown'
		})

		this.pushPlayed(song.url);

		return this.dispatcher!;
	}

	public pushPlayed(url: string): void {
		this.recentlyPlayed.push(url);
		if (this.recentlyPlayed.length > 10) this.recentlyPlayed.shift();
	}

	public pause(): this {
		const { dispatcher } = this;
		if (dispatcher) dispatcher.pause();
		return this;
	}

	public resume(): this {
		const { dispatcher } = this;
		if (dispatcher) dispatcher!.resume();
		return this;
	}

	public skip(force: boolean = false): this {
		const { dispatcher } = this;
		if (force && dispatcher) dispatcher.end();
		else this.queue.shift();
		return this;
	}

	public prune(): this {
		this.queue.length = 0;
		return this;
	}

	public clear(): this {
		this.recentlyPlayed.length = 0;
		this.queue.length = 0;
		this.channel = null;
		this.autoplay = false;
		this._next = null;

		return this;
	}

	public forceDisconnect(): void {
		const { connection } = this;

		if (connection) {
			connection.disconnect()
		} else {
			this.guild.shard.send({
				op: 4,
				shard: this.client.shard ? this.guild.shard.id : 0,
				d: {
					guild_id: this.guild.id,
					channel_id: null,
					self_mute: false,
					self_deaf: false
				}
			})
		}
	}
}