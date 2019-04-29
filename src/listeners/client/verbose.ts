import { Listener } from 'discord-akairo';

export default class VerboseListener extends Listener {
    public constructor() {
        super('verbose', {
            emitter: 'client',
            event: 'verbose',
            category: 'client'
        });
    }

    public exec(thing: string): void {
        this.client.console.verbose(`[VERBOSE] ${thing}`);
    }
}
