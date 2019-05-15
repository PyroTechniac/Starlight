import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';

export default class WikipediaCommand extends Command {
    public constructor(client, store, file, directory) {
        super(client, store, file, directory, {
            aliases: ['wiki'],
            description: 'Finds a Wikipedia Article by title',
            usage: '<query:str>'
        });
        this.customizeResponse('query', 'You must provide me with something to search');
    }

    public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const article = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
            .then((res): any => res.json())
            .catch((): never => { throw 'I couldn\'t find a wikipedia article with that title'; });

        const embed = this.client.util.embed()
            .setColor(4886754)
            .setThumbnail((article.thumbnail && article.thumbnail.source) || 'https://i.imgur.com/fnh1Gh5.png')
            .setURL(article.content_urls.desktop.page)
            .setTitle(article.title)
            .setDescription(article.extract);
        return msg.sendEmbed(embed);
    }
}