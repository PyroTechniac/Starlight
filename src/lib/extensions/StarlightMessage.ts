import { Message, Structures } from 'discord.js';
import { util } from 'klasa';

export class StarlightMessage extends Structures.get('Message') {

	public async nuke(time = 0): Promise<StarlightMessage> {
		if (time === 0) return nuke(this);

		const count = this.edits.length;
		await util.sleep(time);
		return !this.deleted && this.edits.length === count ? nuke(this) : this;
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
