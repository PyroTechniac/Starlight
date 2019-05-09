import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';

export default class CaseCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            name: 'case',
            permissionLevel: 4,
            runIn: ['text'],
            description: (language): string => language.get('COMMAND_CASE_DESCRIPTION'),
            usage: '<case:integer>'
        });
    }

    public async run(msg: KlasaMessage, [selected]: [number]): Promise<KlasaMessage | KlasaMessage[]> {
        const log = msg.guild!.settings.get('modlogs')[selected];
        if (!log) return msg.send(`${msg.language.get('COMMAND_CASE_SORRY')} ${msg.author!}, ${msg.language.get('COMMAND_CASE_NO')}`);

        const [user, moderator] = await Promise.all([
            this.client.users.fetch(log.user),
            this.client.users.fetch(log.moderator)
        ]);

        return msg.send([
            `User      : ${user.tag} (${user.id})`,
            `Moderator : ${moderator.tag} (${moderator.id})`,
            `Reason    : ${log.reason || `${msg.language.get('COMMAND_CASE_REASON')} '${msg.guild!.settings.get('prefix')}reason ${selected}' ${msg.language.get('COMMAND_CASE_CLAIM')}`}`
        ], { code: 'http' });
    }
}