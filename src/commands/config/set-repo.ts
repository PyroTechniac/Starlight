import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class SetGitHubRepositoryCommand extends Command {
    public constructor() {
        super('gh-set-repo', {
            aliases: ['set-repo', 'set-repository'],
            description: {
                content: 'Sets the repository the GitHub commands use',
                usage: '<repo>',
                examples: ['PyroTechniac/Starlight', 'discordjs/discord.js']
            },
            category: 'config',
            channel: 'guild',
            userPermissions: ['MANAGE_GUILD'],
            ratelimit: 2,
            args: [
                {
                    id: 'repository',
                    type: 'string'
                }
            ]
        });
    }

    public async exec(msg: Message, { repository }: {repository: string}): Promise<Message | Message[]> {
        this.client.settings.set(msg.guild, 'githubRepository', repository);
        return msg.util.reply(`Set repo to **${repository}**`);
    }
}
