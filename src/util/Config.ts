import StarlightClient from '../client/StarlightClient';
import { DefaultConfigOptions } from './Constants';
import { StarlightError } from './StarlightError';

export class Config {
    private _token: string;
    private _prefix: string;
    public constructor(public readonly client: StarlightClient, options?: ConfigOptions) {
        options = this.client.util.mergeDefault(DefaultConfigOptions, options);
        Config.validate(options);
        this._token = options.token;
        this._prefix = options.prefix;
    }

    public get token(): string {
        return this._token;
    }

    public get prefix(): string {
        return this._prefix;
    }

    private static validate(options: ConfigOptions) {
        if (options.prefix.length < 1 || options.prefix.length > 15) throw new StarlightError('PREFIX_LENGTH', '1-15', options.prefix.length);
        if (!/^[a-zA-Z0-9._-]{59}$/.test(options.token)) throw new StarlightError('INVALID_TOKEN', options.token);
    }
}

export interface ConfigOptions {
    token: string;
    prefix?: string;
}
