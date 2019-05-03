import { Worker, fork } from 'cluster';
import { BaseCluster, ShardingManager } from '..';
import { IPCEvents } from '../util/Constants';
import { IPCResult } from '../sharding/ShardClientUtil'
import { Util as DjsUtil } from 'discord.js';
import { Util } from '../util/Util'
import { EventEmitter } from 'events'

export interface ClusterOptions {
    id: number;
    shards: number[];
    manager: ShardingManager;
}

export class Cluster extends EventEmitter {
    public ready = false;
    public id: number;
    public shards: number[];
    public worker?: Worker;
    public manager: ShardingManager;

    private _exitListenerFunction: (...args: any[]) => void;

    public constructor(options: ClusterOptions) {
        super();
        this.id = options.id;
        this.shards = options.shards;
        this.manager = options.manager;
        this._exitListenerFunction = this._exitListener.bind(this);

        this.once('ready', () => { this.ready = true })
    }

    private _exitListener(code: number, signal: string) {
        this.ready = false;
        this.worker = undefined;

        if (this.manager.respawn) this.respawn();

        this.manager.emit('debug', `Worker exited with code ${code} and signal ${signal}${this.manager.respawn ? ', restarting...' : ''}`)
    }
}