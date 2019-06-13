import { Event } from 'klasa';

export default class extends Event {
    public run(event: Event, args: any[], error: any): void {
        this.client.emit('wtf', `[EVENT] ${event.path}\n${error ?
            error.stack ? error.stack : error : 'Unknown error'}`);
    }
}