import { ShardingManager } from '..';
import { AkairoClient } from 'discord-akairo';
import { ClientOptions } from 'discord.js';
import { ShardClientUtil } from '../Sharding/ShardClientUtil';
import { IPCEvents } from '../Util/Constants';
import * as Util from '../Util/Util';

export interface CloseEvent {
    code: number;
    reason: string;
    wasClean: boolean;
}

export abstract class BaseCluster {
    public readonly client: AkairoClient;
    public readonly id: number;

    constructor(public manager: ShardingManager) {
        const env = process.env;
        const shards = env.CLUSTER_SHARDS.split(',').map(Number)
        const clientConfig: ClientOptions = Util.mergeDefault<ClientOptions>(manager.clientOptions, {
            shards,
            shardCount: shards.length,
            totalShardCount: Number(env.CLUSTER_SHARD_COUNT)
        })
    }
}