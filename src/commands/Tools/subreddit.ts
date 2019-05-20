import { Command, CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';

export default class SubredditCommand extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['cb'],
            description: 'Returns information on a subreddit',
            usage: '<subredditName:string>'
        });
    }
    private errorMessage: string = 'There was an error. Reddit may be down, or the subreddit does not exist'

    public async run(msg: KlasaMessage, [subredditName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const subreddit = await fetch(`https://www.reddit.com/r/${subredditName}/about.json`)
            .then((res): any => res.json())
            .then((body): any => {
                if (body.kind === 't5') return body.data;
                throw 'That subreddit doesn\'t exist';
            })
            .catch((): never => { throw this.errorMessage; });

        return msg.sendEmbed(this.client.util.embed());
    }
}