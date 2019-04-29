import { Client } from 'discord.js';

export class UnicodeEmoji {
    public name: string;
    public icon: string;
    public constructor(public client: Client, data: UnicodeEmojiData) {
        this.name = data.name;
        this.icon = data.icon;
    }
}

export interface UnicodeEmojiData {
    name: string;
    icon: string;
}
