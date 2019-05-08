import { UserResolvable } from 'discord.js';
import { KlasaClient, KlasaClientOptions } from 'klasa';
import { ClientUtil, Config, ConfigOptions } from '../util';

declare module 'discord.js' {
    interface Client {
        util: ClientUtil;
        isOwner(user: UserResolvable): boolean;
        config: Config;
    }
}

export class StarlightClient extends KlasaClient {
    public util: ClientUtil

    public constructor(options?: KlasaClientOptions & ConfigOptions) {
        super(options);

        this.util = new ClientUtil(this);

        this.config = new Config(this, options);
    }

    public isOwner(user: UserResolvable): boolean {
        const id = this.users.resolveID(user);
        return id === this.owner!.id;
    }
}