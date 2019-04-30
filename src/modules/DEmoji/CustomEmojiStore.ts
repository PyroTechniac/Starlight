import { AkairoClient } from 'discord-akairo';
import { Collection } from 'discord.js';
import { CustomEmoji, RawEmojiData } from './CustomEmoji';
import fetch from 'node-fetch';
import { AnyObj } from '../../util/Constants';
import { RawPackData, Pack } from './Pack';
import { Stats } from './Stats';


export class CustomEmojiStore {
    public categories: Collection<string, string> = new Collection();
    public emojis: Collection<string, CustomEmoji> = new Collection();
    public packs: Collection<string, Pack> = new Collection();
    public stats: Stats = new Stats(this.client, this);
    public constructor(public readonly client: AkairoClient) { }

    public async init() {
        await this.stats.init();
        const categories: AnyObj = await fetch('https://discordemoji.com/api/?request=categories')
            .then(res => res.json());
        for (const key in categories) {
            this.categories.set(key, categories[key]);
        }
        const emojis: RawEmojiData[] = await fetch('https://discordemoji.com/api')
            .then(res => res.json());
        for (const d of emojis) {
            const emoji = new CustomEmoji(this.client, this, d);
            this.emojis.set(emoji.title, emoji);
        }
        const packs: RawPackData[] = await fetch('https://discordemoji.com/api/packs')
            .then(res => res.json());
        for (const d of packs) {
            const pack = new Pack(this.client, this, d);
            this.packs.set(pack.name, pack);
        }
        this.client.emit('debug', `Loaded ${this.categories.size} categories`);
        this.client.emit('debug', `Loaded ${this.emojis.size} emojis`);
        this.client.emit('debug', `Loaded ${this.packs.size} packs`);
    }
}
