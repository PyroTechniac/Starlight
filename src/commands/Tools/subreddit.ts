import { Command, CommandOptions, Language, KlasaMessage } from 'klasa';
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
		await msg.sendLocale('SYSTEM_LOADING');
		const node = await this.client.cdn.acquire(`https://www.reddit.com/r/${subredditName}/about.json`)
			.setCallback((data: InitialBody): RawRedditData => data.kind === 't5' ? data.data : toss(msg.language.get('COMMAND_SUBREDDIT_NOEXIST')))
			.fetch();

		const subreddit = node.data<RawRedditData>()!;

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
