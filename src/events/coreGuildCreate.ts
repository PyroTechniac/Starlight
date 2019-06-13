import { Event, EventStore, SettingsValue } from 'klasa';
import { StarlightGuild } from '../lib/extensions';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            event: 'guildCreate'
        });
    }

    public run(guild: StarlightGuild): void {
        if (!guild.available) return;
        if ((this.client.settings!.get('guildBlacklist')! as SettingsValue[]).includes(guild.id)) {
            guild.leave();
            this.client.emit('warn', `Blacklisted guild detected: ${guild.name} [${guild.id}]`);
        }
    }
}