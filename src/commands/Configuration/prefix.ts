import { Command, CommandStore, KlasaMessage } from 'klasa';
import { StarlightMessage } from '../../lib/extensions/StarlightMessage';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['setPrefix'],
            cooldown: 5,
            description: 'Changes the command prefix the bot uses in your server.',
            permissionLevel: 0,
            runIn: ['text'],
            usage: '[reset|prefix:string{1,10}]'
        });
    }

    public async run(msg: KlasaMessage, [prefix]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        if (!prefix) return msg.send(`The prefix for this guild is \`${msg.guild!.settings.get('prefix')}\``);
        if (!await msg.hasAtLeastPermissionLevel(6)) throw msg.language.get('INHIBITOR_PERMISSIONS');
        if (prefix === 'reset') return this.reset(msg);
        if (msg.guild!.settings.get('prefix') === prefix) throw msg.language.get('CONFIGURATION_EQUALS');
        await msg.guild!.settings.update('prefix', prefix);
        return msg.send(`The prefix for this guild has been set to \`${prefix}\``);
    }

    private async reset(message: StarlightMessage): Promise<KlasaMessage | KlasaMessage[]> {
        await message.guild!.settings.reset('prefix');
        return message.send(`Switched the guild's prefix back to ${this.client.options.prefix}`);
    }
}