import { Monitor, MonitorStore } from 'klasa';
import { Stats } from '../lib';

export default class MessageCounterMonitor extends Monitor {
    public constructor(store: MonitorStore, file: string[], directory: string) {
        super(store, file, directory, {
            ignoreOthers: false
        });
    }
    public run(): void {
        this.stats.inc('messages');
    }

    private get stats(): Stats {
        return this.client.stats;
    }
}