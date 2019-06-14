import { Event, KlasaMessage, Command, Stopwatch, Finalizer } from 'klasa';

export default class extends Event {
    public run(message: KlasaMessage, command: Command, response: KlasaMessage | any, timer: Stopwatch, finalizer: Finalizer, error: any): void {
        this.client.emit('wtf', `[FINALIZER] ${finalizer.path}\n${error ?
            error.stack ? error.stack : error : 'Unknown error'}`);
    }
}