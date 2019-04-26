import { EventEmitter } from 'events';
import { Node, NodeMessage } from 'veza';
import { ShardingManager } from '..';
import { Util } from 'discord.js';
import { isMaster } from 'cluster';
import { IPCEvents } from '../Util/Constants';

export class MasterIPC extends EventEmitter {
    [key: string]: any;
    public node: Node;

    public constructor(public manager: ShardingManager) {
        super();
        this.node = new Node('Master')
            .on('client.identify', client => this.emit('debug', `Client Connected: ${client.name}`))
            .on('client.disconnect', client => this.emit('debug', `Client Disconnected: ${client.name}`))
            .on('client.destroy', client => this.emit('debug', `Client Destroyed: ${client.name}`))
            .on('error', error => this.emit('error', error))
            .on('message', this._incomingMessage.bind(this));
        if (isMaster) this.node.serve(manager.ipcSocket);
    }

    private _incomingMessage(message: NodeMessage) {
        const { op }: { op: number } = message.data;
        this[`_${IPCEvents[op].toLowerCase()}`](message);
    }

    private _message(message: NodeMessage) {
        const { d } = message.data;
        this.manager.emit('message', d);
    }

    private async _broadcast(message: NodeMessage) {
        const { d } = message.data;
        try {
            const data = await this.broadcast(d);
            message.reply({ success: true, d: data });
        } catch (error) {
            message.reply({ success: false, d: { name: error.name, message: error.message, stack: error.stack } });
        }
    }
}
