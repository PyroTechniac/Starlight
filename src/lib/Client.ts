import { Client } from 'discord.js';
import { StarlightClientOptions } from './interfaces';

export class StarlightClient extends Client {
    public options: StarlightClientOptions;

    public constructor(options?: StarlightClientOptions) {
        super(options);

        
    }
}