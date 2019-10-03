import { Events } from '@typings/Enums';
import { ApplyOptions } from '@utils/Decorators';
import { MessageEmbed } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({
	event: 'wtf'
})
export default class extends Event {

	public async run(err: unknown): Promise<void> {
		const errorWebhook = this.client.webhooks.get('error');
		if (!errorWebhook || !errorWebhook.token) return;

		if (!(err instanceof Error) || !err.stack) return;
		let description = err.stack.split('\n').slice(1, 5)!.join('\n');

		if (description.length > 2048) description = description.substring(0, 2045).padEnd(3, '.');

		description = `\`\`\`${description}\`\`\``;

		try {
			await errorWebhook.send(new MessageEmbed()
				.setDescription(description)
				.setTimestamp()
				.setTitle(`${err.name}: ${err.message}`)
				.setColor(0xFC1020));
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

	public init(): Promise<void> {
		if (!this.client.webhooks.has('error')) this.disable();
		return Promise.resolve();
	}

}
