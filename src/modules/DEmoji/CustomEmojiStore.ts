import { AkairoClient } from 'discord-akairo';
import { Collection } from 'discord.js';
import { CustomEmoji, RawEmojiData } from './CustomEmoji';
import fetch from 'node-fetch';


export class CustomEmojiStore {
    public emojis: Collection<string, CustomEmoji> = new Collection();
    public constructor(public readonly client: AkairoClient) { }

    public async init() {
        const emojis: RawEmojiData[] = await fetch('https://discordemoji.com/api')
            .then(res => res.json());
        for (const d of emojis) {
            const emoji = new CustomEmoji(this.client, d);
            this.emojis.set(emoji.title, emoji);
            this.client.emit('verbose', `Loaded emoji ${emoji.title}`);
        }
        this.client.emit('verbose', `Loaded ${this.emojis.size} emojis`);
    }
}
