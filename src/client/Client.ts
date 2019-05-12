import { UserResolvable } from 'discord.js';
import { KlasaClient, KlasaClientOptions, Stopwatch } from 'klasa';
import { ClientUtil, Config, ConfigOptions } from '../util';
import { MusicManager } from '../lib';

declare module 'discord.js' {
    interface Client {
        util: ClientUtil;
        isOwner(user: UserResolvable): boolean;
        config: Config;
        music: MusicManager;
    }
}

export class StarlightClient extends KlasaClient {
    public util: ClientUtil

    public music: MusicManager = new MusicManager(this);

    public constructor(options?: KlasaClientOptions & ConfigOptions) {
        super(options as KlasaClientOptions);

        this.util = new ClientUtil(this);

        this.config = new Config(this, options);
    }

    public isOwner(user: UserResolvable): boolean {
        const id = this.users.resolveID(user);
        return id === this.owner!.id;
    }

    public async start(): Promise<string> {
        const timer = new Stopwatch();
        const log = await super.login(this.config.token);
        await this.init();
        this.emit('log', `Initialized in ${timer.stop()}`);
        return log;
    }

    private async init(): Promise<void> {
        return;
    }
}