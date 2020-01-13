import { Extendable } from '../lib/util/Decorators';
import { DMChannel, Message, TextChannel } from 'discord.js';
import { checkChannel } from '../lib/util/Utils';
import { sleep } from '@klasa/utils';
import { BaseColors, Events } from '../lib/types/Enums';

export default class extends Extendable([Message]) {

	public get text(this: Message): TextChannel | null {
		return checkChannel(this.channel, 'text') ? this.channel : null;
	}

	public get dm(this: Message): DMChannel | null {
		return checkChannel(this.channel, 'dm') ? this.channel : null;
	}

	public get color(this: Message): number {
		return this.member?.displayColor ?? BaseColors.Primary;
	}

	public async nuke(this: Message, time = 0): Promise<Message> {
		if (time === 0) return nuke(this);

		const count = this.edits.length;
		await sleep(time);
		return !this.deleted && this.edits.length === count ? nuke(this) : this;
	}

	public async prompt(this: Message, content: string, time = 30000): Promise<Message> {
		const message = await this.channel.send(content);
		const responses = await this.channel.awaitMessages((msg): boolean => msg.author.id === this.author.id, {
			time,
			max: 1
		});
		message.nuke().catch((err): boolean => this.client.emit(Events.Error, err));
		if (responses.size === 0) throw this.language.get('MESSAGE_PROMPT_TIMEOUT');
		return responses.first()!;
	}

}

async function nuke(message: Message): Promise<Message> {
	try {
		return await message.delete();
	} catch (error) {
		if (error.code === 10008) return message;
		throw error;
	}
}
