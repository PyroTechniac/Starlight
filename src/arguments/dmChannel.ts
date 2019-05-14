import {Argument, KlasaMessage, Possible} from 'klasa';
import {DMChannel} from 'discord.js';

export default class DMChannelArgument extends Argument {
    public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<DMChannel> {
        const user = (this.constructor as typeof Argument).regex.userOrMember.test(arg) ? await this.client.users.fetch((this.constructor as typeof Argument).regex.userOrMember.exec(arg)![1]).catch((): null => null) : null;
        if (user) return user.createDM();
        throw message.language.get('RESOLVER_INVALID_CHANNEL', possible.name);
    }
}