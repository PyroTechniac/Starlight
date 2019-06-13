import { Event } from 'klasa';

export default class extends Event {
    public run(warning: string): void {
        if (this.client.ready) this.client.console.debug(warning);
    }

    public async init(): Promise<void> {
        if (!this.client.options.consoleEvents.debug) this.disable();
    }
}