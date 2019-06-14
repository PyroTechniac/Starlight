import { Event } from 'klasa';

export default class extends Event {
    public run(data: any): void {
        this.client.console.log(data);
    }

    public async init(): Promise<void> {
        if (!this.client.options.consoleEvents.log) this.disable();
    }
}