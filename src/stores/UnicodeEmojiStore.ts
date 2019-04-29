import { DataStore } from 'discord.js';
import { UnicodeEmoji } from '../base/UnicodeEmoji';

type UnicodeEmojiResolvable = string;

export class UnicodeEmojiStore extends DataStore<string, UnicodeEmoji, typeof UnicodeEmoji, UnicodeEmojiResolvable> {

}
