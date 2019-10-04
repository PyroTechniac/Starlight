import { Events } from '../lib/types/Enums';
import { Command, Event, KlasaMessage } from 'klasa';

export default class extends Event {

	public async run(message: KlasaMessage, command: Command, params: unknown[], error: unknown): Promise<void> {
		if (error instanceof Error) {
			await this._handleError(message, command, error);

		} else {
			message.sendMessage(error).catch((err): boolean => this.client.emit(Events.Wtf, err));
		}
	}

	private async _handleError(message: KlasaMessage, command: Command, error: Error): Promise<void> {
		this.client.emit(Events.Wtf, `[COMMAND] ${command.path}\n${error.stack || error}`);
		const isOwner = await message.hasAtLeastPermissionLevel(10);
		if (!isOwner || !error.stack) {
			message.sendCode('JSON', error.message).catch((err): boolean => this.client.emit(Events.Wtf, err));
		} else {
			message.sendCode('JSON', error.stack, { split: true }).catch((err): boolean => this.client.emit(Events.Wtf, err));
		}
	}

}
