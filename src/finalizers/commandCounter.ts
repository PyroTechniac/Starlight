import { Command, Finalizer, KlasaMessage } from 'klasa';
import { Stats } from '../lib';

export default class CommandCounterFinalizer extends Finalizer {
    public async run(msg: KlasaMessage, cmd: Command): Promise<void> {
        this.stats.inc(cmd.name);
        this.stats.pushCommand(cmd);
    }

    private get stats(): Stats {
        return this.client.stats;
    }
}