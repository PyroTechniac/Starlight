import { Message } from 'discord.js';
import { Extendable, ExtendableOptions, util } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';

@ApplyOptions<ExtendableOptions>({
	appliesTo: [Message]
})
export default class extends Extendable {

	public async nuke(this: Message, time = 0): Promise<Message> {
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
