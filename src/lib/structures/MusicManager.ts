import * as ytdl from 'ytdl-core';
import { Client, Guild, StreamDispatcher, TextChannel, VoiceChannel, VoiceConnection, VoiceState } from 'discord.js';
import { Song } from './Song';
import { Events } from '../types/Enums';
import { codeblock } from '../util/Markdown';
import { parse } from 'url';

export class MusicManager {

	public readonly guild!: Guild;

	public autoplay = false;

	public recentlyPlayed: string[] = [];

	public queue: Song[] = [];

	private channelID: string | null = null;

	public constructor(guild: Guild) {
		Object.defineProperty(this, 'guild', { value: guild });
	}

	private _next: string | null = null;

	public get next(): string | null {
		return this._next ? this.resolveLink(this._next) : null;
	}

	public get client(): Client {
		return this.guild.client;
	}

	public get textChannel(): TextChannel | null {
		return this.channelID ? this.guild.channels.get(this.channelID) as TextChannel : null;
	}

	public get voice(): VoiceState | null {
		return this.guild.me?.voice ?? null;
	}

	public get voiceChannel(): VoiceChannel | null {
		return this.guild.me?.voice?.channel ?? null;
	}

	public get connection(): VoiceConnection | null {
		return this.voice?.connection ?? null;
	}

	public get dispatcher(): StreamDispatcher | null {
		return this.connection?.dispatcher ?? null;
	}

	public get playing(): boolean {
		return !this.paused && !this.idling;
	}

	public get paused(): boolean | null {
		return this.dispatcher?.paused ?? null;
	}

	public get idling(): boolean {
		return !this.queue.length || !this.dispatcher;
	}

	public async add(user: string, url: string): Promise<Song> {
		if (!url) throw 'Invalid URL provided!';
		url = this.resolveLink(url)!;
		const data = await new Promise<ytdl.videoInfo>((resolve, reject): void => {
			ytdl.getInfo(url, (err, info): void => {
				if (err) reject(err);
				else resolve(info);
			});

		})
			.catch((err): never => {
				this.client.emit(Events.Error, err);
				throw `Something happened with the YouTube URL: ${url}\n${codeblock`${err}`}`;
			});

		const metadata = {
			id: data.video_id,
			title: data.title.replace(/@(here|everyone)/, '@\u200B$1'),
			user,
			loudness: Number.parseInt(data.loudness),
			seconds: Number.parseInt(data.length_seconds),
			opus: data.formats.some(format => format.codecs === 'opus' && format.container === 'webm')
		};

		const song = new Song(this, metadata);
		this.queue.push(song);

		this._next = this.getLink(data.related_videos);

		return song;
	}

	public getLink(playlist: ytdl.relatedVideo[]) {
		for (const song of playlist) {
			if (!song.id || this.recentlyPlayed.includes(song.id)) continue;
			return song.id;
		}

		return null;
	}

	public resolveLink(idOrUrl: string) {
		const parsed = parse(idOrUrl);
		return (parsed.protocol && parsed.hostname) ? idOrUrl : `https://youtu.be/${idOrUrl}`;
	}

	public join(chan: VoiceChannel): Promise<VoiceConnection> {
		return chan.join().catch((err): never => {
			if (String(err).includes('ECONNRESET')) throw 'There was an error connecting to the voice channel, please try again.';
			this.client.emit(Events.Error, err);
			throw err;
		});
	}

	public async play(): Promise<StreamDispatcher> {
		if (!this.voiceChannel) throw 'Where am I supposed to play the music? I\'m not in a voice channel!';
		if (!this.connection) {
			await this.textChannel!.send('The DJ table isn\'t connected! Let me unplug and plug it back in.')
				.catch((err): boolean => this.client.emit(Events.Error, err));

			const { voiceChannel } = this;
			this.forceDisconnect();
			await this.join(voiceChannel);
			if (!this.connection) throw 'This DJ table is broken! Try again later...';
		}

		if (!this.queue.length) throw 'No songs left in the queue!';

		const [song] = this.queue;

		const stream = await ytdl(this.resolveLink(song.url));

		await this.textChannel!.send('Found the song, downloading...');

		const downloaded = await this.client.manager.resolver.downloadStream(stream);

		this.connection.play(downloaded, {
			bitrate: this.voiceChannel.bitrate / 1000,
			type: song.opus ? 'opus' : 'unknown',
			volume: false
		});

		this.pushPlayed(song.url);

		return this.dispatcher!;
	}

	private pushPlayed(url: string): void {
		this.recentlyPlayed.push(this.resolveLink(url));
		if (this.recentlyPlayed.length > 10) this.recentlyPlayed.shift();
	}

	private forceDisconnect() {
		const { connection } = this;
		if (connection) {
			connection.disconnect();
		} else {
			this.guild.shard.send({
				op: 4,
				shard: this.client.options.shards[0],
				d: {
					guild_id: this.guild.id,
					channel_id: null,
					self_deaf: false,
					self_mute: false
				}
			});
		}
	}

}
