import { KlasaClient } from 'klasa';
import { StarlightClientOptions } from './StarlightClientOptions';
import { SmartGlass } from '../lib/structures/SmartGlass';

export class StarlightClient extends KlasaClient {
    public options: Required<StarlightClientOptions>;

    public xbox: SmartGlass;

    public constructor(options: StarlightClientOptions = {}) {
        super(options);

        this.xbox = new SmartGlass(this, { xboxID: this.options.xboxID, xboxIP: this.options.xboxIP });
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