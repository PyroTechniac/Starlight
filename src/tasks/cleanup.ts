
/**
 * @license
 * MIT License
 *
 * Copyright (c) 2017-2018 Kyra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Util, TextChannel, Channel } from 'discord.js';
import { Task, Colors } from 'klasa';
import { Events } from '../lib/types/Enums';

const THRESHOLD = 1000 * 60 * 30;
const EPOCH = 1420070400000;
const EMPTY = '0000100000000000000000';

export default class extends Task {

	private header = new Colors({ text: 'lightblue' }).format('[MEMORY CLEANUP]');

	private colors = {
		red: new Colors({ text: 'lightred' }),
		yellow: new Colors({ text: 'lightyellow' }),
		green: new Colors({ text: 'green' })
	};

	public run(): void {
		const OLD_SNOWFLAKE = Util.binaryToID(((Date.now() - THRESHOLD) - EPOCH).toString(2).padStart(42, '0') + EMPTY);
		let presences = 0;
		let guildMembers = 0;
		let emojis = 0;
		let lastMessages = 0;
		let users = 0;

		for (const guild of this.client.guilds.values()) {
			presences += guild.presences.size;
			guild.presences.clear();

			const { me } = guild;
			for (const [id, member] of guild.members) {
				if (member === me) continue;
				if (member.voice.channelID) continue;
				if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
				guild.members.delete(id);
				guildMembers++;
			}

			emojis += guild.emojis.size;
			guild.emojis.clear();
		}

		for (const channel of this.client.channels.values()) {
			if (this.isTextChannel(channel) && channel.lastMessageID) {
				channel.lastMessageID = null;
				lastMessages++;
			}
		}

		for (const user of this.client.users.values()) {
			if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
			this.client.users.delete(user.id);
			users++;
		}

		this.client.emit(Events.Verbose,
			`${this.header} ${
				this.setColor(presences)} [Presence]s | ${
				this.setColor(guildMembers)} [GuildMember]s | ${
				this.setColor(users)} [User]s | ${
				this.setColor(emojis)} [Emoji]s | ${
				this.setColor(lastMessages)} [Last Message]s.`);

	}

	private setColor(n: number): string {
		const text = String(n).padStart(5, ' ');

		if (n > 1000) return this.colors.red.format(text);
		if (n > 100) return this.colors.yellow.format(text);
		return this.colors.green.format(text);
	}

	private isTextChannel(channel: Channel): channel is TextChannel {
		return channel.type === 'text';
	}

}
