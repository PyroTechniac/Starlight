import { Inhibitor, KlasaMessage, Command } from 'klasa';

export default class extends Inhibitor {
    public run(message: KlasaMessage, command: Command): void {
        if (!command.requiredSettings.length || message.channel.type !== 'text') return;
        const requiredSettings = command.requiredSettings.filter((setting): boolean => message.guild!.settings.get(setting) == null);
        if (requiredSettings.length) throw message.language.get('INHIBITOR_REQUIRED_SETTINGS', requiredSettings);
    }
}