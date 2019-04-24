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
            }
        })
    }
}