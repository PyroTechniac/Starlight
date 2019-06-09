import { Command, CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';

export default class extends Command {
    private errorMessage: string = 'There was an error. Reddit may be down, or the subreddit doesn\'t exist.'
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['sub'],
            description: 'Returns information on a subreddit.',
            usage: '<subredditName:string>'
        });
    }

    public async run(msg: KlasaMessage, [subredditName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const subreddit = await fetch(`https://www.reddit.com/r/${subredditName}/about.json`)
            .then((res): any => res.json())
            .then((body): any => {
                if (body.kind === 't5') return body.data;
                throw 'That subreddit doesn\'t exist.';
            })
            .catch((): never => { throw this.errorMessage; });

        return msg.sendEmbed(this.client.util.embed()
            .setTitle(subreddit.title)
            .setDescription(subreddit.public_description)
            .setURL(`https://www.reddit.com/r/${subredditName}/`)
            .setColor(6570404)
            .setThumbnail(subreddit.icon_img)
            .setImage(subreddit.banner_img)
            .addField('Subscribers', subreddit.subscribers.toLocaleString(), true)
            .addField('Users Active', subreddit.accounts_active.toLocaleString(), true));
    }
}