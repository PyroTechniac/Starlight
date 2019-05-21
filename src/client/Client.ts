import { UserResolvable } from 'discord.js';
import { KlasaClient, KlasaClientOptions, Stopwatch } from 'klasa';
import { ClientUtil, Config, ConfigOptions } from '../util';
import { Stats } from '../lib';
declare module 'discord.js' {
    interface Client {
        util: ClientUtil;
        isOwner(user: UserResolvable): boolean;
        config: Config;
        stats: Stats;
    }
}

export class StarlightClient extends KlasaClient {
    public util: ClientUtil

    public stats: Stats;

    public constructor(options?: KlasaClientOptions & ConfigOptions) {
        super(options as KlasaClientOptions);

        this.util = new ClientUtil(this);

        this.config = new Config(this, options);

        this.stats = new Stats(this);
    }

    public isOwner(user: UserResolvable): boolean {
        const id = this.users.resolveID(user);
        for (const user of this.owners.values()) {
            if (user.id === id) return true;
        }
        return false;
    }

    public async start(): Promise<string> {
        const timer = new Stopwatch();
        await this.init();
        this.emit('log', `Initialized in ${timer.stop()}`);
        return this.login(this.config.token);
    }

    private async init(): Promise<void> {
        return;
    }
}