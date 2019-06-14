import { Event } from 'klasa';

export default class extends Event {
    public run(failure: any): void {
        this.client.console.wtf(failure);
    }

    public async init(): Promise<void> {
        if (!this.client.options.consoleEvents.wtf) this.disable();
    }
}