import { Event, EventStore, util } from 'klasa';
let retries = 0;

export default class extends Event {
    public constructor(store, file, directory) {
        super(store, file, directory, {
            once: true,
            event: 'ready'
        });
    }

    public async run(): Promise<boolean> {
        try {
            await this.client.fetchApplication();
        } catch (err) {
            if (++retries === 3) return process.exit();
            this.client.emit('warning', `Unable to fetchApplication at this time, waiting 5 seconds and retrying. Retries left: ${retries - 3}`);
            await util.sleep(5000);
            return this.run();
        }

        if (!this.client.options.owners.length) this.client.options.owners.push(this.client.application.owner!.id);

        this.client.mentionPrefix = new RegExp(`^<@!?${this.client.user!.id}>`);

        const clientStorage = this.client.gateways.get('clientStorage')!;

        // @ts-ignore
        clientStorage.cache.set(this.client.user!.id, this.client);
        this.client.settings = clientStorage.create(this.client, this.client.user!.id);
        await this.client.gateways.sync();

        await this.client.schedule.init();

        await Promise.all(this.client.pieceStores.filter((store): boolean => !['providers', 'extendables'].includes(store.name)).map((store): any => store.init()));
        // @ts-ignore
        util.initClean(this.client);
        this.client.ready = true;

        if (this.client.options.readyMessage !== null) {
            this.client.emit('log', util.isFunction(this.client.options.readyMessage) ? this.client.options.readyMessage(this.client) : this.client.options.readyMessage);
        }

        return this.client.emit('klasaReady');
    }
}