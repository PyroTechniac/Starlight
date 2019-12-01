import { Message, Structures } from 'discord.js';
import { util } from 'klasa';
import { Events } from '../types/Enums';

// TODO: Modify command handling behavior with special Error to allow users to grab debug information.

export class StarlightMessage extends Structures.get('Message') {

	public async nuke(time = 0): Promise<Message> {
		if (time === 0) return nuke(this);

		const count = this.edits.length;
		await util.sleep(time);
		return !this.deleted && this.edits.length === count ? nuke(this) : this;
	}

	public async prompt(content: string, time = 30000): Promise<Message> {
		const message = await this.channel.send(content);
		const responses = await this.channel.awaitMessages((msg): boolean => msg.author.id === this.author.id, { time, max: 1 });
		message.nuke().catch((err): boolean => this.client.emit(Events.Error, err));
		if (responses.size === 0) throw this.language.get('MESSAGE_PROMPT_TIMEOUT');
		return responses.first()!;
	}

}

Structures.extend('Message', (): typeof Message => StarlightMessage);

async function nuke(message: Message): Promise<Message> {
	try {
		return await message.delete();
	} catch (error) {
		if (error.code === 10008) return message;
		throw error;
	}
}
