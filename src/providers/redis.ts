import { Provider, KlasaClient, ProviderStore, util } from 'klasa'
import { Client } from 'redis-nextra'

export default class RedisProvider extends Provider {
    private db: Client;

    public constructor(client: KlasaClient, store: ProviderStore, file: string[], directory: string) {
        super(client, store, file, directory)
        // @ts-ignore
        const { hosts, options } = util.mergeDefault(this.client.options.providers.redis, {
            hosts: ['127.0.0.1:6379'],
            options: {}
        })

        this.db = new Client(hosts, options);

        this.db.on('ready', () => this.client.emit('debug', 'Redis initialized.'))
            .on('serverReconnect', (server): boolean => this.client.emit('warn', `Redis server: ${server.host.string} is reconnecting`))
            .on('error', (err): boolean => this.client.emit('error', err))
    }

    public hasTable(table: string): Promise<boolean> {
        return this.db.tables.has(table) as unknown as Promise<boolean>;
    }

    public createTable(table: string): Promise<Set<string>> {
        return this.db.createTable(table) as unknown as Promise<Set<string>>;
    }

    public deleteTable(table: string): Promise<boolean> {
        return this.db.deleteTable(table);
    }

    public getAll(table: string): Promise<string[]> {
        return this.db.table(table).valuesJson('*')
    }
}