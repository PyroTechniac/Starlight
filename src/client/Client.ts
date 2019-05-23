import { User, UserResolvable } from 'discord.js';
import { KlasaClient, KlasaClientOptions, Stopwatch } from 'klasa';
import { List, Stats, CanvasStore } from '../lib';
import { ClientUtil, Config, ConfigOptions } from '../util';
declare module 'discord.js' {
    interface Client {
        util: ClientUtil;
        isOwner(user: UserResolvable): boolean;
        config: Config;
        stats: Stats;
        canvas: CanvasStore;
    }
}

export class StarlightClient extends KlasaClient {
    public util: ClientUtil

    public stats: Stats;

    public canvas: CanvasStore;

    public constructor(options?: KlasaClientOptions & ConfigOptions) {
        super(options as KlasaClientOptions);

        this.util = new ClientUtil(this);

        this.config = new Config(this);

        this.stats = new Stats(this);

        this.canvas = new CanvasStore(this);
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
        Config.validate(this.config);
        return;
    }

    public get owners(): List<User> {
        const owners = this.util.list<User>();
        for (const owner of this.options.owners) {
            const user = this.users.get(owner);
            if (user) owners.add(user);
        }
        return owners;
    }

    public toJSON(): object {
        return { ...super.toJSON(), config: this.config };
    }

    public destroy(): void {
        this.stats.destroy();
        return super.destroy();
    }
}