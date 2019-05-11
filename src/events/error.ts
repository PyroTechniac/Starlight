import { Event } from 'klasa';
import { captureException } from 'raven';

export default class ErrorEvent extends Event {
    public run(err: any): void {
        this.client.console.error(err);
        captureException(err);
    }
    public init(): any {
        if (!this.client.options.consoleEvents.error) this.disable();
    }
}