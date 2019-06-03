import { KlasaClient } from 'klasa';
import { StarlightClientOptions } from './StarlightClientOptions';

export class StarlightClient extends KlasaClient {
    public options: Required<StarlightClientOptions>;

    private _token: string;

    public constructor(options: StarlightClientOptions = {}) {
        super(options);

        this._token = options.token || '';
    }

    public async start(): Promise<string> {
        await this.init();
        return this.login(this._token);
    }

    public async init(): Promise<void> {
        // Placeholder
    }
}