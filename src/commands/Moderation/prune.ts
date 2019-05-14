import { Command, CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';

export default class PruneCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file, directory) {
        super(client, store, file, directory, {
            name: 'prune',
            permissionLevel: 4,
            requiredPermissions: ['MANAGE_MESSAGES'],
            runIn: ['text'],
            description: 'Prunes a certain amount of messages w/o filter',
            usage: '[limit:integer{1,100}] [link|invite|bots|you|me|upload|user:user]',
            usageDelim: ' '
        });
    }
    
    public async run(msg: KlasaMessage, [limit = 50, filter = null]: [number, string | null]): Promise<KlasaMessage | KlasaMessage[]> {
        let messages: any = await msg.channel.messages.fetch({ limit: 100 });
        if (filter) {
            const user = typeof filter !== 'string' ? filter : null;
            const type = typeof filter === 'string' ? filter : 'user';
            messages = messages.filter(this.getFilter(msg, type, user));
        }
        messages = messages.array().slice(0, limit);
        await msg.channel.bulkDelete(messages);
        return msg.send(`Successfully deleted ${messages.length} messages from ${limit}`);
    }

    private getFilter(msg: KlasaMessage, filter: string, user: KlasaUser | null): (mes: KlasaMessage) => boolean {
        switch(filter) {
            case 'link': return (mes: KlasaMessage): boolean => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
            case 'invite': return (mes: KlasaMessage): boolean => /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(mes.content);
            case 'bots': return (mes: KlasaMessage): boolean => mes.author!.bot;
            case 'you': return (mes: KlasaMessage): boolean => mes.author!.id === this.client.user!.id;
            case 'me': return (mes: KlasaMessage): boolean => mes.author!.id === msg.author!.id;
            case 'upload': return (mes: KlasaMessage): boolean => mes.attachments.size > 0;
            case 'user': return (mes: KlasaMessage): boolean => mes.author!.id === user!.id;
            default: return (): boolean => true;
        }
    }
}