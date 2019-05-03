import { EventEmitter } from 'events';
import { ClientOptions } from 'discord.js';
import StarlightClient from '../../client/StarlightClient';

export interface SharderOption {
    token?: string;
    shardCount?: number | 'auto';
    clusterCount?: number;
    name?: string;
    development?: boolean;
    guildsPerShards?: number;
    clientOptions?: ClientOptions
    respawn?: boolean;
    ipcSocket?: string | number;
    timeout?: number;
}

export interface SessionObject {
    url: string;
    shards: number;
    session_start_limit: {
        total: number;
        remaining: number;
        reset_after: number;
    };
}

export class ShardingManager extends EventEmitter {
    public clientOptions: ClientOptions;
    public client: typeof StarlightClient;
    public ipcSocket: string | number;
    public respawn: boolean;
}
