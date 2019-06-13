import { TextChannel } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';

const API_URL = 'https://discordemoji.com/api/';

export default class extends Command {
    private emojis: any;

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['de'],
            description: 'Searches discordemoji.com for an emoji.',
            usage: '<query:str{1,20}> [count:int{1,100}]',
            usageDelim: ',',
            runIn: ['text']
        });
    }

    public async run(msg: KlasaMessage, [query, count = 4]: [string, number?]): Promise<KlasaMessage | KlasaMessage[]> {
        const matches = this.emojis.filter(({ nsfw, title }): any => {
            if (!(msg.channel as TextChannel).nsfw && nsfw) return false;
            return title.toUpperCase().includes(query.toUpperCase());
        });

        if (matches.length === 0) throw 'No results found.';
        return msg.send(
            matches
                .sort((): number => Math.random() * 0.5)
                .slice(0, count)
                .map((emj): any => emj.image)
                .join(' ')
        );
    }

    public async init(): Promise<void> {
        const [emojis, cats] = await Promise.all(
            [API_URL, `${API_URL}?request=categories`].map((url): any => fetch(url).then((res): any => res.json()))
        );

        this.emojis = emojis.map((emj): any => ({
            ...emj,
            category: cats[emj.category],
            nsfw: cats[emj.category] === 'NSFW',
            description: emj.description.includes('View more') ? '' : emj.description
        }));
    }
}