import { KlasaClient, Inhibitor, InhibitorStore, KlasaMessage, Command } from 'klasa';

export default class CooldownInhibitor extends Inhibitor {
    public constructor(client: KlasaClient, store: InhibitorStore, file: string[], directory: string) {
        super(client, store, file, directory, { spamProtection: true });
    }

    public run(message: KlasaMessage, command: Command): void {
        if (message.author! === this.client.owner || command.cooldown <= 0) return;

        // @ts-ignore
        const existing = command.cooldowns.get(message.levelID);

        if (existing && existing.limited) throw message.language.get('INHIBITOR_COOLDOWN', Math.ceil(existing.remainingTime / 1000));
    }
}