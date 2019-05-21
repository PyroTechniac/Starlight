import { Command, CommandStore } from 'klasa';
import fetch from 'node-fetch';
import * as qs from 'querystring';
import { KlasaMessage } from 'klasa';
import { TextChannel } from 'discord.js';

export default class DocsCommand extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            cooldownLevel: 'channel',
            description: 'Searches the discord.js docs for something',
            usage: '<query:string> [stable|rpc|commando|11.5-dev|master:default]',
            requiredPermissions: ['EMBED_LINKS'],
            usageDelim: ' '
        });
    }

    public async run(msg: KlasaMessage, [query, project]: [string, string]): Promise<KlasaMessage | KlasaMessage[]> {
        const q = query.split(' ');
        if (project === '11.5-dev') {
            project = `https://raw.githubusercontent.com/discordjs/discord.js/docs/${project}.json`;
        }
        const queryString = qs.stringify({ src: project, q: q.join(' '), force: 'force' in msg.flags ? msg.flags.force : false });
        const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`);
        const embed = await res.json();
        if (!embed) {
            return msg.send('Couldn\'t find anything with that query');
        }
        if (msg.channel.type === 'dm' || !(msg.channel as TextChannel).permissionsFor(msg.guild!.me!)!.has(['ADD_REACTIONS'], false)) {
            return msg.sendEmbed(this.client.util.embed(embed));
        }
        return msg.sendEmbed(this.client.util.embed(embed));
    }
}