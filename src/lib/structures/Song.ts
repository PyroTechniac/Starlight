import { MusicManager } from './MusicManager';
import { Client, User } from 'discord.js';

export class Song {

	public manager: MusicManager;
	public id: string;
	public title: string;
	private _user: string;
	public loudness: number;
	public opus: boolean;
	public constructor(manager: MusicManager, data: SongData) {
		this.manager = manager;
		this.id = data.id;
		this.title = data.title;
		this._user = data.user;
		this.loudness = data.loudness;
		this.opus = data.opus;
	}

	public get client(): Client {
		return this.manager.client;
	}

	public get user(): User | null {
		return this.client.users.get(this._user) ?? null;
	}

	public get url(): string {
		return `https://youtu.be/${this.id}`;
	}


}

export interface SongData {
	id: string;
	title: string;
	user: string;
	loudness: number;
	seconds: number;
	opus: boolean;
}
