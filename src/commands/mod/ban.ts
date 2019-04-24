import { Argument, Command } from 'discord-akairo';
import { Message, GuildMember, TextChannel, User } from 'discord.js';
import { stripIndents } from 'common-tags';
import Util from '../../util/Constants';

export default class BanCommand extends Command {
    public constructor() {
        super('ban', {
            aliases: ['ban'],
            category: 'mod',
            description: {
                content: 'Bans a member',
                usage: '<member> <...reason>',
                examples: ['@BotPyro']
            },
            channel: 'guild',
            clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
            ratelimit: 2,
            args: [
                {
                    id: 'member',
                    type: Argument.union('member', async (_, phrase): Promise<{ id: string, user: User } | null> => {
                        const m = await this.client.users.fetch(phrase);
                        if (m) return { id: m.id, user: m }
                        return null;
                    }),
                    prompt: {
                        start: (message: Message): string => `${message.author}, what member do you want to ban?`,
                        retry: (message: Message): string => `${message.author}, please mention a member`
                    }
                },
                {
                    id: 'days',
                    type: 'integer',
                    match: 'option',
                    flag: ['--days', '-d'],
                    default: 7
                }
            ]
        })
    }
}