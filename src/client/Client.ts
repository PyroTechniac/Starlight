import { KlasaClient, KlasaClientOptions } from 'klasa';
import { ClientUtil } from '../util/StarlightUtil';

declare module 'klasa' {
    interface KlasaClient {
        util: ClientUtil;
    }
}

export class StarlightClient extends KlasaClient {
    public util: ClientUtil

    public constructor(options?: KlasaClientOptions) {
        super(options);

        this.util = new ClientUtil(this);
    }
}