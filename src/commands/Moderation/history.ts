import { Command, CommandStore, KlasaClient, KlasaMessage, util } from 'klasa';
import { KlasaUser } from 'klasa';

export default class HistoryCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            name: 'history',
            permissionLevel: 0,
            runIn: ['text'],
            description: 'Check the history for the mentioned user',
            usage: '[user:user]'
        });
    }

    public async run(msg: KlasaMessage, [user = msg.author!]: [KlasaUser]): Promise<KlasaMessage | KlasaMessage[]> {
        const userlogs = (msg.guild!.settings.get('modlogs') as any[]).filter((log): boolean => log.user === user.id);
        if (userlogs.length === 0) return msg.send(`There is no log under the ${user.tag} (${user.id}) account`);
        const actions = {
            ban: 0,
            unban: 0,
            softban: 0,
            kick: 0,
            warn: 0
        };
        for (const log of userlogs) {
            actions[log.type]++;
        }
        return msg.send([
            `Dear ${msg.author}, the user ${user.tag} (${user.id}) has the following logs`,
            util.codeBlock('http', Object.entries(actions).map(([action, value]): string => `${util.toTitleCase(`${action}s`).padEnd(9)}: ${value}`))
        ]);
    }
}