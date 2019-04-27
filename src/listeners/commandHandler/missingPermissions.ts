import { Command, Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MissingPermissionsListener extends Listener {
    public constructor() {
        super('missingPermissions', {
            emitter: 'commandHandler',
            event: 'missingPermissions',
            category: 'commandHandler'
        });
    }

    public async exec(message: Message, command: Command, type: 'client' | 'user', missing: string[]): Promise<Message | Message[]> {
        if (type === 'client') {
            return message.util.send(`It looks like I don't have permissions to do that, I'm missing the ${missing.join(', ')} permission${missing.length === 1 ? '' : 's'}`);
        }
        if (type === 'user') {
            return message.util.send(`It looks like you don't have permissions to do that, you're missing the ${missing.join(', ')} permission${missing.length === 1 ? '' : 's'}`);
        }
    }
}
