import StarlightClient from '../client/StarlightClient';
import { DefaultConfigOptions } from './Constants';

export class Config {
    private _token: string;
    private _prefix: string;
    public constructor(public readonly client: StarlightClient, options?: ConfigOptions) {
        options = this.client.util.mergeDefault(DefaultConfigOptions, options);
        this._token = options.token;
        this._prefix = options.prefix;
    }

    public get token(): string {
        return this._token;
    }

    public get prefix(): string {
        return this._prefix;
    }
}

export interface ConfigOptions {
    token: string;
    prefix?: string;
}
