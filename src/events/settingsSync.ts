import { Events } from '@typings/Enums';
import { Guild, GuildMember, User } from 'discord.js';
import { Event, Settings, Type } from 'klasa';

export default class extends Event {

	public run(settings: Settings): void {
		if (settings.target instanceof User) {
			this.client.emit(Events.Verbose, `[SETTINGS] Synced data for user ${settings.target.username}.`);
		} else if (settings.target instanceof Guild) {
			this.client.emit(Events.Verbose, `[SETTINGS] Synced data for guild ${settings.target.name}.`);
		} else if (settings.target instanceof GuildMember) {
			this.client.emit(Events.Verbose, `[SETTINGS] Synced data for guild member ${settings.target.displayName}.`);
		} else if (settings.target instanceof this.client.constructor) {
			this.client.emit(Events.Verbose, `[SETTINGS] Synced data for client ${settings.target.user!.username}.`);
		} else {
			this.client.emit(Events.Verbose, `[SETTINGS] Synced data for unknown target ${new Type(settings.target)}.`);
		}
	}

}
