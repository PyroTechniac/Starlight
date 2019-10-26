import { Argument, Possible, KlasaMessage } from 'klasa';
import { noop } from '../lib/util/Utils';
import { HelixUser } from 'twitch';

export default class extends Argument {
    public async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<HelixUser> {
        const user = await this.client.twitch.helix.users.getUserById(arg).catch(noop);

        if (user) return user;

        const userName = await this.client.twitch.helix.users.getUserByName(arg).catch(noop);
        if (userName) return userName;

        throw "Couldn't find a twitch user with that name...";
    }
}