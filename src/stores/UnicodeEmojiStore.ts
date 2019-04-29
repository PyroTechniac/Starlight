import { Client, DataStore } from 'discord.js';
import { UnicodeEmoji, UnicodeEmojiData } from '../base/UnicodeEmoji';

type UnicodeEmojiResolvable = string;

export class UnicodeEmojiStore extends DataStore<string, UnicodeEmoji, typeof UnicodeEmoji, UnicodeEmojiResolvable> {
    public constructor(client: Client) {
        super(client, null, UnicodeEmoji);
    }

    public init(data: UnicodeEmojiData[]): void {
        for (const d of data) this.set(d.name, new UnicodeEmoji(this.client, d));
    }
}
