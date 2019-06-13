import { Inhibitor, InhibitorStore, KlasaMessage, Command } from 'klasa';

export default class extends Inhibitor {
    public constructor(store: InhibitorStore, file: string[], directory: string) {
        super(store, file, directory, { spamProtection: true });
    }

    public run(message: KlasaMessage, command: Command): void {
        if (this.client.owners.has(message.author!) || command.cooldown <= 0) return;

        // @ts-ignore
        const existing = command.cooldowns.get(message.levelID!);

        if (existing && existing.limited) throw message.language.get('INHIBITOR_COOLDOWN', Math.ceil(existing.remainingTime / 1000));
    }
}