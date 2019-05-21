import { Monitor } from 'klasa';

export default class MessageCounterMonitor extends Monitor {
    public run(): void {
        return this.client.stats.inc('messages');
    }
}