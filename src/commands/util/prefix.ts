import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
    public constructor() {
        super('prefix', {
            aliases: ['prefix'],
            description: {
                content: 'Displays or changes the prefix of the guild',
                usage: '[prefix]',
                examples: ['*', 'Sunshine']
            },
            category: 'util',
            channel: 'guild',
            ratelimit: 2,
            args: [
                {
                    id: 'prefix',
                    type: 'string'
                }
            ]
        });
    }

    public async exec(message: Message, { prefix }: {prefix: string}): Promise<Message | Message[]> {
        // @ts-ignore
        if (!prefix) return message.util.send(`The current prefix for this guild is: \`${this.handler.prefix(message)}\``);
        this.client.settings.set(message.guild, 'prefix', prefix);
        if (prefix === process.env.PREFIX) {
            return message.util.reply(`The prefix has been reset to \`${prefix}\``);
        }
        return message.util.reply(`The prefix has been set to \`${prefix}\``);
    }
}
