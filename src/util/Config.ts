import StarlightClient from '../client/StarlightClient';
import { DefaultConfigOptions } from './Constants';
import { StarlightError } from './StarlightError';
import { Counter } from './Counter';

export class Config {
    private _token: string;
    private _prefix: string;
    private _ownerID: string;
    private _messages: Counter = new Counter(this.client, this);
    private _commands: Counter = new Counter(this.client, this);
    public constructor(public readonly client: StarlightClient, options?: ConfigOptions) {
        options = this.client.util.mergeDefault(DefaultConfigOptions, options);
        this.validate(options);
        this._token = options.token;
        this._prefix = options.prefix;
        this._ownerID = options.ownerID;
    }

    public get messages(): Counter {
        return this._messages;
    }

    public get commands(): Counter {
        return this._commands;
    }

    public get token(): string {
        return this._token;
    }

    public get prefix(): string {
        return this._prefix;
    }

    public get ownerID(): string {
        return this._ownerID;
    }

    public set ownerID(id: string) {
        this.client.ownerID = id;
        this._ownerID = id;
    }

    private validate(options: ConfigOptions) {
        if (options.prefix.length < 1 || options.prefix.length > 15) throw new StarlightError('PREFIX_LENGTH', '1-15', options.prefix.length);
        if (!/^[a-zA-Z0-9._-]{59}$/.test(options.token)) throw new StarlightError('INVALID_TOKEN', options.token);
        if (!options.ownerID) this.client.console.debug('No owner ID provided, will be loaded when client is ready');
    }
}

export interface ConfigOptions {
    token: string;
    prefix?: string;
    ownerID?: string;
}
