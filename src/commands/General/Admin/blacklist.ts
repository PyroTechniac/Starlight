import { User } from 'discord.js';
import { Command, CommandStore, KlasaGuild, KlasaMessage, KlasaUser, Language, SettingsValue } from 'klasa';
import { List } from '../../../lib';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 10,
            description: (lang: Language): string => lang.get('COMMAND_BLACKLIST_DESCRIPTION'),
            usage: '<User:user|Guild:guild|guild:str> [...]',
            usageDelim: ' ',
            guarded: true
        });
    }

    private terms: string[] = ['usersAdded', 'usersRemoved', 'guildsAdded', 'guildsRemoved'];

    public async run(message: KlasaMessage, [usersAndGuilds]: [(KlasaUser | KlasaGuild | string)[]]): Promise<KlasaMessage | KlasaMessage[]> {
        const changes: [string[], string[], string[], string[]] = [[], [], [], []];
        const queries: [string[], string[]] = [[], []];

        for (const userOrGuild of new List(usersAndGuilds)) {
            const type = userOrGuild instanceof User ? 'user' : 'guild';
            if ((this.client.settings!.get(`${type}Blacklist`) as SettingsValue[]).includes((userOrGuild as KlasaUser | KlasaGuild).id || userOrGuild)) {
                changes[this.terms.indexOf(`${type}sRemoved`)].push((userOrGuild as KlasaGuild).name || (userOrGuild as KlasaUser).username || (userOrGuild as string));
            } else {
                changes[this.terms.indexOf(`${type}sAdded`)].push((userOrGuild as KlasaGuild).name || (userOrGuild as KlasaUser).username || (userOrGuild as string));
            }
            queries[Number(type === 'guild')].push((userOrGuild as KlasaGuild | KlasaUser).id || (userOrGuild as string));
        }

        const { errors } = await this.client.settings!.update([['userBlacklist', queries[0]], ['guildBlacklist', queries[1]]]);
        if (errors.length) throw String(errors[0]);

        return message.sendLocale('COMMAND_BLACKLIST_SUCCESS', changes);
    }
}