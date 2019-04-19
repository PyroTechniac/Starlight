import { Listener } from 'discord-akairo';

export default class ShardReconnectListener extends Listener {
    public constructor() {
        super('shardReconnecting', {
            emitter: 'client',
            event: 'shardReconnecting',
            category: 'client'
        });
    }

    public exec(id: number): void {
        this.client.logger.info(`[SHARD] Reconnecting shard ${id}`);
    }
}
