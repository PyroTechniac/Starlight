import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stringify } from 'querystring';
import fetch from 'node-fetch';

const Turndown = require('turndown') // eslint-disable-line
export default class MDNCommand extends Command {
    public constructor() {
        super('mdn', {
            aliases: ['mdn', 'mozilla-developer-network'],
            category: 'docs',
            description: {
                content: 'Searches MDN for your query',
                usage: '<query>',
                examples: ['Map', 'Map#get', 'Map.set']
            },
            regex: /^(?:mdn,) (.+)/i,
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    id: 'query',
                    prompt: {
                        start: (message: Message): string => `${message.author}, what would you like to search for?`
                    },
                    match: 'content',
                    type: (_, query): string | null => query ? query.replace(/#/g, '.prototype.') : null
                }
            ]
        });
    }

    public async exec(message: Message, { query, match }: { query: string; match: any }): Promise<Message | Message[]> {
        if (!query && match) query = match[1];
        const queryString = stringify({ q: query });
        const res = await fetch(`https://mdn.pleb.xyz/search?${queryString}`);
        const body = await res.json();
        if (!body.URL || !body.Title || !body.Summary) {
            return message.util.send('I couldn\'t find anything, please try again');
        }

        const turndown = new Turndown();
        turndown.addRule('hyperlink', {
            filter: 'a',
            replacement: (text: string, node: { href: string }): string => `[${text}](https://developer.mozilla.org${node.href})`
        });
        const summary = body.Summary.replace(/<code><strong>(.+)<\/strong><\/code>/g, '<strong><code>$1<\/code><\/strong>');
        const embed = this.client.util.embed()
            .setColor(0x066FAD)
            .setAuthor('MDN', 'https://i.imgur.com/DFGXabG.png', 'https://developer.mozilla.org/')
            .setURL(`https://developer.mozilla.org${body.URL}`)
            .setTitle(body.Title)
            .setDescription(turndown.turndown(summary));

        return message.util.send(embed);
    }
}
