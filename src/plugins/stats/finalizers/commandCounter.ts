import { Command, Finalizer, KlasaMessage } from 'klasa';

export default class CommandCounterFinalizer extends Finalizer {
    public run(msg: KlasaMessage, command: Command): void {
        this.client.stats.get('commands')!.inc(command.name);
    }
}