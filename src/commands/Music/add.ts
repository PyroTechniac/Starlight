import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';
import { stringify } from 'querystring';
import { MusicCommand } from '../../lib';

const URL = 'https://www.googleapis.com/youtube/v3/search?';

export default class AddCommand extends MusicCommand {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            description: 'Adds a song to the queue',
            usage: '<url:string>'
        });
    }

    public async run(msg: KlasaMessage, [url]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const youtubeURL = await this.getURL(url);
        if (!youtubeURL) throw 'Not found.';

        const { music } = msg.guild!;
        const song = await music.add(msg.author!, youtubeURL!);

        return msg.send(`🎵 Added **${song!.title}** to the queue 🎶`);
    }

    private async getURL(url: string): Promise<string | null> {
        const id = MusicCommand.YOUTUBE_REGEX.exec(url);
        if (id) return `https://youtu.be/${id![1]}`;

        const query = stringify({
            part: 'snippet',
            q: url,
            key: this.client.config.google
        });
        const { items } = await fetch(URL + query)
            .then((result): any => result.json());

        const video = items.find((item): any => item.id.kind === 'youtube#video');
        return video ? `https://youtu.be/${video.id.videoId}` : null;
    }
}