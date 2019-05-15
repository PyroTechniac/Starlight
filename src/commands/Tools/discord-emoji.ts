import { Client, Command, CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';
import { TextChannel } from 'discord.js';

const API_URL = 'https://discordemoji.com/api/';

export default class DiscordEmojiCommand extends Command {
    public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['de'],
            autoAliases: true,
            usage: '<query:str{1,20}> [count:int{1,100}]',
            usageDelim: ',',
            runIn: ['text']
        });
    }
    private emojis: { [key: string]: any }[] | null = null

    public async run(msg: KlasaMessage, [query, count = 4]: [string, number]): Promise<KlasaMessage | KlasaMessage[]> {
        const matches = this.emojis!.filter(({ nsfw, title }): boolean => {
            if (!(msg.channel as TextChannel).nsfw && nsfw) return false;
            return title.toUpperCase().includes(query.toUpperCase());
        });

        if (matches.length === 0) throw 'No results found with that query';

        return msg.send(
            matches
                .sort((): number => Math.random() - 0.5)
                .slice(0, count)
                .map((emj): any => emj.image)
                .join(' '));
    }

    public async init(): Promise<void> {
        const [emojis, cats] = await Promise.all(
            [API_URL, `${API_URL}?request=categories`].map((url): any => fetch(url).then((res): any => res.json()))
        );

        this.emojis = emojis.map((emj: any): any => ({
            ...emj,
            category: cats[emj.category],
            nsfw: cats[emj.category] === 'NSFW',
            description: emj.description.includes('View more') ? '' : emj.description
        }));
    }
}