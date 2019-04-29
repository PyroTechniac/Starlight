import StarlightClient from '../client/StarlightClient';
import { DefaultConfigOptions } from './Constants';

export class Config {
    public token: string;
    public prefix: string;
    public constructor(public client: StarlightClient, options?: ConfigOptions) {
        options = this.client.util.mergeDefault(DefaultConfigOptions, options);
        this.token = options.token;
        this.prefix = options.prefix;
    }
}

export interface ConfigOptions {
    token: string;
    prefix?: string;
}
