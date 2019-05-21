import { Command, CommandStore } from 'klasa';
import fetch from 'node-fetch';
import * as qs from 'querystring';
import { KlasaMessage } from 'klasa';
const Turndown = require('turndown'); // eslint-disable-line

export default class MDNCommand extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['mozilla-developer-network'],
            autoAliases: true,
            description: 'Searches MDN for your query',
            requiredPermissions: ['EMBED_LINKS'],
            usage: '<query:string>'
        });
    }

    private parse(query: string): string {
        return query.replace(/#/g, '.prototype.');
    }

    public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const queryString = qs.stringify({ q: this.parse(query) });
        const res = await fetch(`https://mdn.pleb.xyz/search?${queryString}`);
        const body = await res.json();
        if (!body.URL || !body.Title || !body.Summary) return msg.send('I couldn\'t find the requested information');
        const turndown = new Turndown();
        turndown.addRule('hyperlink', {
            filter: 'a',
            replacement: (text: string, node: { href: string }): string => `[${text}](https://developer.mozilla.org${node.href})`
        });
        const summary = body.Summary.replace(/<code><strong>(.+)<\/strong><\/code>/g, '<strong><code>$1<\/code><\/strong>'); // eslint-disable-line no-useless-escape
        const embed = this.client.util.embed()
            .setColor(0x066FAD)
            .setAuthor('MDN', 'https://i.imgur.com/DFGXabG.png', 'https://developer.mozilla.org/')
            .setURL(`https://developer.mozilla.org${body.URL}`)
            .setTitle(body.Title)
            .setDescription(turndown.turndown(summary));

        return msg.sendEmbed(embed);
    }
}