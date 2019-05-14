import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';

export default class PrefixCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['setPrefix'],
            cooldown: 5,
            description: 'Change the command prefix the bot uses in your server',
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

    private async reset(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        await msg.guild!.settings.reset('prefix');
        return msg.send(`Switched the guild's prefix back to \`${this.client.config.prefix}\``);
    }
}