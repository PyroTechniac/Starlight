import { Command, Event, KlasaMessage } from 'klasa';
import { Events, PermissionLevels } from '../lib/types/Enums';

export default class extends Event {

	public async run(message: KlasaMessage, command: Command, params: unknown[], error: unknown): Promise<void> {
		if (error instanceof Error) {
			await this.handleError(message, command, error);
		} else {
			await message.send(error).catch((err): boolean => this.client.emit(Events.Wtf, err));
		}
	}

	private async handleError(message: KlasaMessage, command: Command, error: Error): Promise<void> {
		this.client.emit(Events.Wtf, `[COMMAND] ${command.path}\n${error.stack || error}`);
		const isOwner = await message.hasAtLeastPermissionLevel(PermissionLevels.BotOwner);
		if (!isOwner || !error.stack) {
			await message.sendCode('JSON', error.message).catch((err): boolean => this.client.emit(Events.Wtf, err));
		} else {
			await message.sendCode('JSON', error.stack, { split: true }).catch((err): boolean => this.client.emit(Events.Wtf, err));
		}
	}

}
