import { CustomEmojiStore } from './CustomEmojiStore';
import { AkairoClient } from 'discord-akairo';
import fetch from 'node-fetch';


export interface RawStats {
    emoji: number;
    users: number;
    faves: number;
    pending_approvals: number;
}

export class Stats {
    public emojis: number;
    public users: number;
    public favorites: number;
    public pending: number;
    public constructor(private client: AkairoClient, private store: CustomEmojiStore) { }

    public async init() {
        const data: RawStats = await fetch('https://discordemoji.com/api/?request=stats')
            .then(res => res.json());
        return this.patch(data);
    }

    private patch(data: RawStats) {
        this.emojis = data.emoji;
        this.favorites = data.faves;
        this.users = data.users;
        this.pending = data.pending_approvals;
    }
}
