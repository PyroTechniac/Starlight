import { captureException } from 'raven';
import { Event } from 'klasa';

export default class WarnEvent extends Event {
    public run(warning: any): void {
        this.client.console.warn(warning);
        captureException(warning);
    }

    public init(): any {
        if (!this.client.options.consoleEvents.warn) this.disable();
    }
}