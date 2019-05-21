import { Collection, MessageReaction, TextChannel } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';
import * as qs from 'querystring';

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
        const message = await msg.sendEmbed(this.client.util.embed(embed)) as KlasaMessage;
        message.react('🗑');
        let react: Collection<string, MessageReaction>;
        try {
            react = await message.awaitReactions(
                (reaction, user): boolean => reaction.emoji.name === '🗑' && user.id === msg.author!.id,
                { max: 1, time: 5000, errors: ['time'] }
            );
        } catch (error) {
            message.reactions.removeAll();

            return msg;
        }
        react.first()!.message.delete();

        return msg;
    }
}