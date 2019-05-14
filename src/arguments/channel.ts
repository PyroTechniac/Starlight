import {Argument, KlasaMessage, Possible} from 'klasa';
import { Channel } from 'discord.js';

export default class ChannelArgument extends Argument {
    public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<Channel | null> {
        const channel = (this.constructor as typeof Argument).regex.channel.test(arg) ? await this.client.channels.fetch((this.constructor as typeof Argument).regex.channel.exec(arg)![1]).catch((): null => null) : null;
        if (channel) return channel;

        const user = (this.constructor as typeof Argument).regex.userOrMember.test(arg) ? await this.client.users.fetch((this.constructor as typeof Argument).regex.userOrMember.exec(arg)![1]).catch((): null => null) : null;
        if (user) return user.createDM();
        throw message.language.get('RESOLVER_INVALID_CHANNEL', possible.name);
    }
}