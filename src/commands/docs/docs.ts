import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import * as qs from 'querystring';

const SOURCES: string[] = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master'];

export default class DocsCommand extends Command {
    public constructor() {
        super('docs', {
            aliases: ['docs'],
            description: {
                content: 'Searches discord.js documentation',
                usage: '<query>',
                examples: ['TextChannel', 'Client', 'ClientUser#setActivity master']
            },
            category: 'docs',
            clientPermissions: ['EMBED_LINKS'],
            ratelimit: 2,
            args: [
                {
                    id: 'query',
                    match: 'rest',
                    type: 'lowercase',
                    prompt: {
                        start: (message: Message): string => `${message.author}, what would you like to search?`
                    }
                },
                {
                    id: 'force',
                    match: 'flag',
                    flag: ['--force', '-f']
                }
            ]
        })
    }

    public async exec(message: Message, { query, force }: { query: string, force: boolean }): Promise<Message | Message[]> {
        const q = query.split(' ');
        const source = SOURCES.includes(q.slice(-1)[0]) ? q.pop() : 'master';
        const queryString = qs.stringify({ src: source, q: q.join(' '), force })
        const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`)
        const embed = await res.json();
        if (!embed) return message.util.reply("I couldn't find the requested information, please try again with a better search query");
        if (message.channel.type === 'dm' || !(message.channel as TextChannel).permissionsFor(message.guild.me).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) return message.util.send({ embed })
    }
}