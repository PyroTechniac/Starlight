import { Structures } from '../lib';

export default class extends Structures.get('Event') {
    public run(warning: any): void {
        this.client.console.debug(warning);
    }

    public async init(): Promise<void> {
        if (!this.client.options.consoleEvents.debug) this.disable();
    }
}