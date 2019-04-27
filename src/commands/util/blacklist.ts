import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';

export default class BlacklistCommand extends Command {
    public constructor() {
        super('blacklist', {
            aliases: ['blacklist'],
            description: {
                content: 'Toggles a user\'s blacklist state, preventing/allowing them to use Starlight',
                usage: '<user>',
                examples: ['BotPyro', '@BotPyro#0826', '293865523198951424']
            },
            category: 'util',
            userPermissions: ['MANAGE_ROLES'],
            ratelimit: 2,
            args: [
                {
                    id: 'user',
                    match: 'content',
                    type: 'user',
                    prompt: {
                        start: (message: Message): string => `${message.author}, who would you like to black/whitelist?`
                    }
                }
            ]
        });
    }

    public async exec(message: Message, { user }: { user: User }): Promise<Message | Message[]> {
        const blacklist: string[] = this.client.settings.get('global', 'blacklist', []);
        if (blacklist.includes(user.id)) {
            const index: number = blacklist.indexOf(user.id);
            blacklist.splice(index, 1);
            if (blacklist.length === 0) this.client.settings.delete('global', 'blacklist');
            else this.client.settings.set('global', 'blacklist', blacklist);

            return message.util.send(`${user.tag} has been unblacklisted`);
        }
        blacklist.push(user.id);
        this.client.settings.set('global', 'blacklist', blacklist);

        return message.util.send(`${user.tag} has been blacklisted`);
    }
}
