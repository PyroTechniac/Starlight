import { Event } from 'klasa';

export default class extends Event {
    public run(warning: any): void {
        this.client.console.warn(warning);
    }
}