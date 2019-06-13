import { Event } from 'klasa';

export default class extends Event {
    public run(log: any): void {
        this.client.console.verbose(log);
    }

    public async init(): Promise<void> {
        if (!this.client.options.consoleEvents.verbose) this.disable();
    }
}