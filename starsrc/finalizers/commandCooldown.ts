import { Finalizer, KlasaMessage, Command } from 'klasa';

export default class extends Finalizer {
    public run(message: KlasaMessage, command: Command): void {
        if (command.cooldown <= 0 || this.client.owners.has(message.author!)) return;

        try {
            // @ts-ignore
            command.cooldowns.acquire(message.levelID!).drip();
        } catch (err) {
            this.client.emit('error', `${message.author!.username}[${message.author!.id}] has exceeded the RateLimit for ${message.command}`);
        }
    }
}