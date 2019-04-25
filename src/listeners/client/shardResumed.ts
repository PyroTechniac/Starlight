import { Listener } from 'discord-akairo';

export default class ShardResumedListener extends Listener {
    public constructor() {
        super('shardResumed', {
            emitter: 'client',
            event: 'shardResumed',
            category: 'client'
        });
    }

    public exec(id: number): void {
        console.info(`[SHARD] Shard ${id} successfully resumed`);
    }
}
