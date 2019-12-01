import { Command, Event, KlasaMessage } from 'klasa';
import { ErrorLike, StarlightError } from '../lib/structures/StarlightError';
import { Events } from '../lib/types/Enums';

export default class extends Event {

	public async run(message: KlasaMessage, command: Command, params: any[], error: ErrorLike | StarlightError | string): Promise<void> {
		if (error instanceof Error) this.client.emit(Events.Wtf, `[COMMAND] ${command.path}\n${error.stack || error}`);
		const resolved = StarlightError.resolve(error);
		const starlightError = new StarlightError(resolved.message, resolved);

		const debug = 'debug' in message.flagArgs;
		await (debug ? message.sendCode.bind(message, 'JSON') : message.sendMessage.bind(message))(starlightError.message(debug)).catch((err): boolean => this.client.emit(Events.Wtf, err));
	}

}
