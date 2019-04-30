import * as WebSocket from 'ws';
import backoff = require('backoff');
import { BaseNode as Node } from '../base/Node';
import { IncomingMessage } from 'http';

interface Sendable {
    resolve: () => void;
    reject: (e: Error) => void;
    data: Buffer | string;
}

interface Headers {
    Authorization: string;
    'Num-Shards': number;
    'User-Id': string;
    'Resume-Key'?: string;
}

export class Connection {
    public readonly node: Node;
    public url: string;
    public options: WebSocket.ClientOptions;
    public resumeKey?: string;

    public ws!: WebSocket;
    public reconnectTimeout: number = 100;

    private _backoff!: backoff.Backoff;

    private _queue: Array<Sendable> = [];

    private _listeners = {
        open: () => {
            this.backoff.reset();
            this.node.emit('open');
            this._flush();
        }
    }

    public get backoff(): backoff.Backoff {
        return this._backoff;
    }

    private async _flush() {
        await Promise.all(this._queue.map(this._send));
    }

    public send(d: object): Promise<void> {
        return new Promise((resolve, reject) => {
            const encoded = JSON.stringify(d);
            const send = { resolve, reject, data: encoded };

            if (this.ws.readyState === WebSocket.OPEN) this._send(send);
            else this._queue.push(send);
        });
    }

    private _send({ resolve, reject, data }: Sendable) {
        this.ws.send(data, err => {
            if (err) reject(err);
            else resolve();
        });
    }

    private async _reconnect() {
        if (this.ws.readyState === WebSocket.CLOSED) this.backoff.backoff();
    }
}
