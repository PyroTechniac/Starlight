import { Command, CommandOptions, KlasaMessage, Language } from 'klasa';
import { ApplyOptions } from '../../lib/util/Decorators';
import { toss } from '../../lib/util/Utils';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['sub'],
	description: (lang: Language): string => lang.get('COMMAND_SUBREDDIT_DESCRIPTION'),
	usage: '<subredditName:string>'
})
export default class extends Command {

	public async run(msg: KlasaMessage, [subredditName]: [string]): Promise<KlasaMessage> {
		await msg.sendEmbed(new MessageEmbed()
			.setColor(6570404)
			.setDescription(msg.language.get('SYSTEM_LOADING')));
		const subreddit = (await this.client.cdn.acquire(`https://www.reddit.com/r/${subredditName}/about.json`)
			.setCallback((data: InitialBody): RawRedditData => data.kind === 't5'
				? {
					title: data.data.title,
					public_description: data.data.public_description,
					icon_img: data.data.icon_img,
					banner_img: data.data.banner_img,
					subscribers: data.data.subscribers,
					accounts_active: data.data.accounts_active
				}
				: toss(msg.language.get('COMMAND_SUBREDDIT_NOEXIST')))
			.fetch()
			.catch((): never => toss(msg.language.get('COMMAND_SUBREDDIT_ERROR'))))
			.data<RawRedditData>()!;

		return msg.sendEmbed(new MessageEmbed()
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

interface InitialBody {
	kind: string;
	data: RawRedditData;
}

interface RawRedditData {
	title: string;
	public_description: string;
	icon_img: string;
	banner_img: string;
	subscribers: number;
	accounts_active: number;
}
