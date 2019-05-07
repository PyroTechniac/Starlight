import { Client, ClientOptions } from 'discord.js';
import { dirname } from 'path';
import { StarlightOptions } from './interfaces';

export class StarlightClient extends Client {
    public userBaseDirectory!: string;
    public options: StarlightOptions
    public constructor(options?: StarlightOptions) {
        super(options);

        this.userBaseDirectory = dirname(require.main!.filename);
    }
}