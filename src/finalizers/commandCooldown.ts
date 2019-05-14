import { Command, Finalizer, KlasaMessage } from 'klasa';

export default class CommandCooldownFinalizer extends Finalizer {
    public run(message: KlasaMessage, command: Command): void {
        if (command.cooldown <= 0 || message.author === this.client.owner) return;

        try {
            // @ts-ignore
            command.cooldowns.acquire(message.levelID).drip();
        } catch (err) {
            this.client.emit('error', `${message.author!.username}[${message.author!.id}] has exceeded the RateLimit for ${message.command!}`);
        }
    }
}