import { Inhibitor, InhibitorStore, RateLimitManager, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
    private slowmode: RateLimitManager = new RateLimitManager(1, this.client.options.slowmode);

    private aggressive: boolean = this.client.options.slowmodeAggressive;

    public constructor(store: InhibitorStore, file: string[], directory: string) {
        super(store, file, directory, { spamProtection: true });

        if (!this.client.options.slowmode) this.disable();
    }

    public run(message: KlasaMessage): void {
        if (this.client.owners.has(message.author!)) return;

        const rateLimit = this.slowmode.acquire(message.author!.id);

        try {
            rateLimit.drip();
        } catch (err) {
            if (this.aggressive) rateLimit.resetTime();
            throw true;
        }
    }
}