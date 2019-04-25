import { Listener } from 'discord-akairo';


export default class ShardDisconnectListener extends Listener {
    public constructor() {
        super('shardDisconnected', {
            emitter: 'client',
            event: 'shardDisconnected',
            category: 'client'
        });
    }

    public exec(event: any, id: number): void {
        console.warn(`[SHARD] Shard ${id} disconnected with code ${event}`);
    }
}
