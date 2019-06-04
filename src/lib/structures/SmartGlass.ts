import * as dgram from 'dgram';
import { StarlightClient } from '../../client/StarlightClient';
import { SmartGlassOptions } from '../interfaces/SmartGlassOptions';

/* eslint-disable @typescript-eslint/camelcase, no-useless-escape */

export class SmartGlass {
    public readonly client: StarlightClient;

    public readonly options: SmartGlassOptions;

    private _socket: dgram.Socket;

    public lastMessageTime: number;

    public isBroadcast: boolean;

    public constructor(client: StarlightClient, options: SmartGlassOptions = {}) {
        Object.defineProperty(this, 'client', { value: client });

        Object.defineProperty(this, 'options', { value: options });

        this.isBroadcast = false;
    }

    private _getSocket(): dgram.Socket {
        this._socket = dgram.createSocket('udp4');
        this._socket.bind();

        this._socket.on('listening', (): void => {
            if (this.isBroadcast) {
                this._socket.setBroadcast(true)
            }
        })

        this._socket.on('error', (err): boolean => this.client.emit('error', err));

        this._socket.on('message', (message, remote): void => {
            this.lastMessageTime = Math.floor(Date.now() / 1000);
            this.client.emit('xboxMessage', message, remote, this);
        })

        return this._socket;
    }

    public async on(): Promise<any> {
        this._getSocket();
    }
}