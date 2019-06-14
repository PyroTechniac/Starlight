import { Event, KlasaMessage, Monitor } from 'klasa';

export default class extends Event {
    public run(message: KlasaMessage, monitor: Monitor, error: any): void {
        this.client.emit('wtf', `[MONITOR] ${monitor.path}\n${error ?
            error.stack ? error.stack : error : 'Unknown error'}`);
    }
}