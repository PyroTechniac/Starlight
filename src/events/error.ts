import { Event } from 'klasa';

export default class extends Event {
    public run(err: any): void {
        this.client.console.error(err);
    }

    public async init(): Promise<void> {
        if (!this.client.options.consoleEvents.error) this.disable();
    }
}