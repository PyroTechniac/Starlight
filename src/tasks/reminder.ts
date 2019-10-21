import { Task, Timestamp } from 'klasa';
import { ReminderTaskData } from '../lib/types/Interfaces';
import { DiscordAPIError } from 'discord.js';


export default class extends Task {

	private timestamp = new Timestamp('MMMM d, hh:mm:ss');

	public async run(data: ReminderTaskData): Promise<void> {
		const user = await this.client.users.fetch(data.user)
			.catch(this.catchError.bind(this));

		if (user) {
			await user.send(`⏲ Hey! You asked me on ${this.timestamp.displayUTC()} to remind you:\n*${data.content}*`)
				.catch(this.catchError.bind(this));
		}
	}

	private catchError(error: DiscordAPIError): void {
		if ([50007, 10013].includes(error.code)) return;
		throw error;
	}

}
