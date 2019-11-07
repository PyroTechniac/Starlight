import { Event, KlasaMessage, Stopwatch } from 'klasa';
import TagCommand from '../commands/Tag/tag';
import { GuildSettings } from '../lib/settings/GuildSettings';
import { floatPromise } from '../lib/util/Utils';
import { Events } from '../lib/types/Enums';

export default class extends Event {

	public run(message: KlasaMessage, command: string): Promise<void> {
		if (!message.guild) return Promise.resolve();

		command = command.toLowerCase();

		const tags = message.guild.settings.get(GuildSettings.Tags);
		const tag = tags.some((t): boolean => t[0] === command);
		if (tag) return this.runTag(message, command);

		return Promise.resolve();
	}

	private async runTag(message: KlasaMessage, command: string): Promise<void> {
		const tagCommand = this.client.commands.get('tag') as TagCommand;
		const timer = new Stopwatch();

		try {
			await this.client.inhibitors.run(message, tagCommand);
			try {
				const commandRun = tagCommand.show(message, [command]);
				timer.stop();
				const response = await commandRun;
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				floatPromise(this, this.client.finalizers.run(message, tagCommand, response!, timer));
				this.client.emit(Events.CommandSuccess, message, tagCommand, ['show', command], response);
			} catch (error) {
				this.client.emit(Events.CommandError, message, tagCommand, ['show', command], error);
			}
		} catch (response) {
			this.client.emit(Events.CommandInhibited, message, tagCommand, response);
		}
	}

}
