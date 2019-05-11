import { Event } from 'klasa';
import { captureException } from 'raven';

export default class WTFEvent extends Event {
    public run(failure: any): void {
        this.client.console.wtf(failure);
        captureException(failure);
    }

    public init(): any {
        if (!this.client.options.consoleEvents.wtf) this.disable();
    }
}