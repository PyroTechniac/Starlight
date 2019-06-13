import { Command, CommandStore, KlasaMessage, util } from 'klasa';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 6,
            runIn: ['text'],
            requiredSettings: ['minAccAge'],
            description: 'Checks the guild for any user accounts younger than the minimum account age.'
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const accAge: number = msg.guild!.settings.get('minAccAge') as number;
        const mtime = msg.createdTimestamp;

        const users: string[] = [];

        for (const member of msg.guild!.members.values()) {
            if ((mtime - member.user.createdTimestamp) >= accAge) continue;
            users.push(`${member.user.tag}, Created:${((mtime - member.user.createdTimestamp) / 1000 / 60).toFixed(0)} min(s) ago`);
        }

        return msg.sendMessage(users.length > 0 ?
            `The following users are less than the Minimum Account Age:${util.codeBlock('', users.join('\n'))}` :
            'No users less than the Minimum Account Age were found in this server.');
    }
}