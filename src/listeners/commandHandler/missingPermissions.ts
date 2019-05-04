import { Command, Listener } from 'discord-akairo';
import { BitFieldResolvable, Message, PermissionString, TextChannel, User } from 'discord.js';

export default class MissingPermissionsListener extends Listener {
    public constructor() {
        super('missingPermissions', {
            event: 'missingPermissions',
            emitter: 'commandHandler',
            category: 'commandHandler'
        });
    }

    public exec(message: Message, command: Command, type: 'client' | 'user', missing: BitFieldResolvable<PermissionString>) {
        const text = {
            client: () => {
                const str = this.missingPermissions(message.channel as TextChannel, this.client.user, missing);
                return `I'm missing ${str} to use that command`;
            },
            user: () => {
                const str = this.missingPermissions(message.channel as TextChannel, message.author, missing);
                return `You're missing ${str} to use that command`;
            }
        }[type];

        const tag = message.guild ? message.guild.name : `${message.author.tag}/PM`;

        this.client.console.info(`=> ${command.id} - ${type}Permissions`, { tag });

        if (!text) return;
        if (message.guild ? (message.channel as TextChannel).permissionsFor(this.client.user).has('SEND_MESSAGES') : true) {
            message.reply(text());
        }
    }

    public missingPermissions(channel: TextChannel, user: User, permissions: BitFieldResolvable<PermissionString>) {
        const missingPerms = channel.permissionsFor(user).missing(permissions)
            .map(str => {
                if (str === 'VIEW_CHANNEL') return '`Read Messages`';
                if (str === 'SEND_TTS_MESSAGES') return '`Send TTS Messages`';
                if (str === 'USE_VAD') return '`Use VAD`';
                return `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``;
            });

        return missingPerms.length > 1
            ? `${missingPerms.slice(0, -1).join(', ')} and ${missingPerms.slice(-1)[0]}`
            : missingPerms[0];
    }
}
