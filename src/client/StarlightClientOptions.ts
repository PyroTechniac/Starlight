import { KlasaClientOptions } from 'klasa';

export interface StarlightClientOptions extends KlasaClientOptions {
    xboxID?: string;
    xboxIP?: string;
    token?: string;
}