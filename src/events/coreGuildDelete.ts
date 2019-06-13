import { Event, EventStore } from 'klasa';
import { StarlightGuild } from '../lib/extensions';
import { Util } from '../lib/util';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            event: 'guildDelete'
        });
    }

    public run(guild: StarlightGuild): void {
        if (this.client.ready && guild.available && !this.client.options.preserveSettings) guild.settings.destroy().catch(Util.noop);
    }
}