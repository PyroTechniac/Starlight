import { AkairoClient } from 'discord-akairo';
import { Collection } from 'discord.js';
import { CustomEmoji, RawEmojiData } from './CustomEmoji';
import fetch from 'node-fetch';
import { AnyObj } from '../../util/Constants';
import { RawPackData, Pack } from './Pack';
import { Stats } from './Stats';
const packUrl = 'https://discordemoji.com/api/packs';
const categoryUrl = 'https://discordemoji.com/api/?request=categories';
const emojiUrl = 'https://discordemoji.com/api';
const json = res => res.json();
const noop = () => null;

const loadedMessage = (col: Collection<string, string> | Collection<string, CustomEmoji> | Collection<string, Pack>, type: string): string => `Loaded ${col.size} ${type}`;


export class CustomEmojiStore {
    public categories: Collection<string, string> = new Collection();
    public emojis: Collection<string, CustomEmoji> = new Collection();
    public packs: Collection<string, Pack> = new Collection();
    public stats: Stats = new Stats(this.client, this);
    public constructor(public readonly client: AkairoClient) { }

    public async init() {
        await this.stats.init();
        const [packs, categories, emojis]: [RawPackData[], AnyObj, RawEmojiData[]] = await Promise.all([
            fetch(packUrl).then(json).catch(noop),
            fetch(categoryUrl).then(json).catch(noop),
            fetch(emojiUrl).then(json).catch(noop)
        ]);
        for (const key in categories) {
            this.categories.set(key, categories[key]);
        }
        for (const d of emojis) {
            const emoji = new CustomEmoji(this.client, this, d);
            this.emojis.set(emoji.title, emoji);
        }
        for (const d of packs) {
            const pack = new Pack(this.client, this, d);
            this.packs.set(pack.name, pack);
        }
        this.client.emit('debug', loadedMessage(this.categories, 'categories'));
        this.client.emit('debug', loadedMessage(this.emojis, 'emojis'));
        this.client.emit('debug', loadedMessage(this.packs, 'packs'));
    }
}
