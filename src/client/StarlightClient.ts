import { KlasaClient } from 'klasa';
import { StarlightClientOptions } from './StarlightClientOptions';
const SmartGlass = require('xbox-smartglass-core-node'); // eslint-disable-line

export class StarlightClient extends KlasaClient {
    public options: Required<StarlightClientOptions>;

    public xbox: any;
    public constructor(options: StarlightClientOptions = {}) {
        super(options);

        this.xbox = SmartGlass();
    }

    private get _token(): string {
        return this.options.token || '';
    }

    public async start(): Promise<string> {
        await this.init();
        return this.login(this._token);
    }

    public async init(): Promise<void> {
        // Placeholder
    }
}