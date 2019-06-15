import { Event, EventStore, ScheduledTask, ScheduledTaskOptions } from 'klasa';
import { Constants, Util } from '../lib/util';
import { Node } from 'veza';
import { stop } from 'pm2';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            once: true
        });
    }

    public async run(): Promise<void> {
        await this.ensureTask('cleanup', '*/8 * * * *', { catchUp: false });
        await this.ensureTask('setPresence', '@hourly', { data: Constants.DefaultPresenceData, catchUp: false });

        await this.client.user!.setPresence(Constants.DefaultPresenceData);

        try {
            await this.node.connectTo('Moonlight', 6969);
        } catch (error) {
            this.client.emit('error', error);

            stop('starlight', Util.noop);
            process.exit();
        }
    }

    private async ensureTask(task: string, time: string | number | Date, data?: ScheduledTaskOptions): Promise<ScheduledTask | void> {
        const { tasks } = this.client.schedule;

        if (!tasks.some((s): boolean => s.taskName === task)) {
            this.client.emit('debug', `Creating task ${task}`);
            return this.client.schedule.create(task, time, data);
        }
    }

    private get node(): Node {
        return this.client.node;
    }
}