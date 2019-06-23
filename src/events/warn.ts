import { Event } from 'klasa';

export default class extends Event {
    public run(warning: any): void {
        this.client.console.warn(warning);
    }

    public async init(): Promise<void> {
        if (!this.client.options.consoleEvents.warn) this.disable();
    }
}