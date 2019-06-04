import { KlasaClientOptions } from 'klasa';

export interface StarlightClientOptions extends KlasaClientOptions {
    token?: string;
    xboxID?: string;
    xboxIP?: string;
}