import { Command } from 'discord-akairo';
import { Message } from 'discord.js';


export default class SetGitHubRepoCommand extends Command {
    public constructor() {
        super('gh-set-repo', {
            aliases: ['set-repo', 'set-repository'],
            description: {
                content: 'Sets the repository the GitHub commands use',
                usage: '<repo>',
                examples: ['discordjs/discord.js', 'PyroTechniac/Starlight']
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

    public async exec(message: Message, { repository }: { repository: string }): Promise<Message | Message[]> {
        this.client.settings.set(message.guild!, 'githubRepository', repository);
        return message.util.reply(`Repo has been set to **${repository}**`);
    }
}
