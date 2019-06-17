import { Event, EventStore, ScheduledTask, ScheduledTaskOptions } from 'klasa';
import { Constants } from '../lib/util';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, { once: true });
    }

    public async run(): Promise<void> {
        await this.ensureTask('setPresence', '@hourly', { data: Constants.DefaultPresenceData, catchUp: false });

        await this.client.user!.setPresence(Constants.DefaultPresenceData);

        for (const guild of this.client.guilds.values()) {
            await guild.settings.sync(true);
            if (!guild.settings.get('updateOnSave') && guild.settings.get('created')) continue;
            await guild.settings.update([['general.verificationLevel', guild.verificationLevel], ['created', true], ['general.name', guild.name], ['general.region', guild.region], ['general.iconURL', guild.iconURL()]]);

            await guild.settings.update([['afk.channel', guild.afkChannel], ['afk.timeout', guild.afkTimeout]]);
            this.client.emit('debug', `Updated settings for ${guild.name} [${guild.id}]`);
        }
    }

    private async ensureTask(task: string, time: string | number | Date, data?: ScheduledTaskOptions): Promise<ScheduledTask | void> {
        const { tasks } = this.client.schedule;

        if (!tasks.some((s): boolean => s.taskName === task)) {
            const created = await this.client.schedule.create(task, time, data);
            this.client.emit('log', `Created task ${created.taskName} (${created.id})`);
            return created;
        }
    }
}