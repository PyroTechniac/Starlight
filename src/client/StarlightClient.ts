import { Client, KlasaClientOptions, KlasaUser, Settings } from 'klasa';
import { ClientUtil, List } from '../lib/util';

declare module 'discord.js' {
    interface Client {
        util: ClientUtil;
    }

    interface GuildMember {
        settings: Settings;
    }
}

export class StarlightClient extends Client {
    public constructor(options: KlasaClientOptions) {
        super(options);
        this.util = new ClientUtil(this);
    }
    public get owners(): List<KlasaUser> {
        const owners = new List<KlasaUser>();
        for (const owner of this.options.owners) {
            const user = this.users.get(owner);
            if (user) owners.add(user);
        }
        return owners;
    }
}