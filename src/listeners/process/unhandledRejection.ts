import { Listener } from 'discord-akairo';

export default class PromiseRejectionListener extends Listener {
    public constructor() {
        super('unhandledRejection', {
            emitter: 'process',
            event: 'unhandledRejection',
            category: 'process'
        });
    }

    public exec(e: Error): void {
        if (!e) return;
        this.client.console.error(`[PROMISE REJECTION] Uncaught Promise Error: \n${e.stack || e}`);
    }
}
