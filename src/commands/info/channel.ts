import { Command } from 'discord-akairo';
import { DMChannel, GuildChannel, TextChannel, Message } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';
import 'moment-duration-format';

export default class ChannelInfoCommand extends Command {
    public constructor() {
        super('channel', {
            aliases: ['channel'],
            description: {
                content: 'Get info about a channel',
                usage: '[channel]',
                examples: ['#general', 'general', '222197033908436994']
            },
            category: 'info',
            channel: 'guild',
            clientPermissions: ['EMBED_LINKS'],
            ratelimit: 2,
            args: [
                {
                    'id': 'channel',
                    'match': 'content',
                    'type': 'channel',
                    'default': (message: Message): GuildChannel | DMChannel => message.channel
                }
            ]
        });
    }

    public async exec(msg: Message, { channel }: { channel: TextChannel }): Promise<Message | Message[]> {
        const embed = this.client.util.embed()
            .setColor(this.client.defaultEmbedColor)
            .setDescription(`Info about **${channel.name}** (ID: ${channel.id})`)
            .addField(
                '❯ Info',
                stripIndents`
				• Type: ${channel.type}
				• Topic ${channel.topic ? channel.topic : 'None'}
				• NSFW: ${Boolean(channel.nsfw)}
				• Creation Date: ${moment.utc(channel.createdAt).format('YYYY/MM/DD hh:mm:ss')}
			`
            )
            .setThumbnail(msg.guild.iconURL());
        return msg.util.send(embed);
    }
}
