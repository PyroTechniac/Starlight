import { MessageEmbed } from 'discord.js';
import { Event, EventOptions } from 'klasa';
import { ApplyOptions, Events } from '../lib';

@ApplyOptions<EventOptions>({
	event: 'error'
})
export default class extends Event {

	public async run(err: unknown): Promise<void> {
		const errorWebhook = this.client.webhooks.get('error');
		if (!errorWebhook) {
			this.client.emit(Events.Wtf, 'Error webhook not found.');
			return;
		}

		if (!(err instanceof Error) || !err.stack) return;

		let description = err.stack.split('\n').slice(0, 5)!.join('\n');

		if (description.length > 2048) description = description.substring(0, 2045).padEnd(3, '.');

		description = `\`\`\`${description}\`\`\``;

		try {
			await errorWebhook.send(new MessageEmbed()
				.setDescription(description)
				.setTimestamp()
				.setAuthor(err.name)
				.setColor(0xFC1020));
		} catch (error) {
			this.client.emit(Events.Wtf, err);
		}
	}

}
