import { Inhibitor, KlasaMessage, Command } from 'klasa';
import { StarlightTextChannel } from '../lib';

export default class extends Inhibitor {
    public run(message: KlasaMessage, command: Command): void {
        if (command.nsfw && !(message.channel as StarlightTextChannel).nsfw) throw message.language.get('INHIBITOR_NSFW');
    }
}