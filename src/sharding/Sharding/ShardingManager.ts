import { CloseEvent } from '../Cluster/BaseCluster';
import { AkairoClient } from 'discord-akairo';
import { ClientOptions } from 'discord.js';
import { MasterIPC } from '../IPC/MasterIPC';
import { http } from '../Util/Constants';
import { EventEmitter } from 'events';
import { cpus, platform } from 'os';
import { isMaster } from 'cluster';
import * as Util from '../Util/Util';
import fetch from 'node-fetch';

export interface SharderOptions {
    token?: string;
    shardCount?: number | 'auto';
    clusterCount?: number;
    name?: string;
    development?: boolean;
    client?: typeof AkairoClient;
    clientOptions?: ClientOptions;
    guildsPerShard?: number;
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
    public ipcSocket: string | number;
}
