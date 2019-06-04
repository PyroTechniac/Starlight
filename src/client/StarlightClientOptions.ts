import { KlasaClientOptions } from 'klasa';

export interface StarlightClientOptions extends KlasaClientOptions {
    token?: string;
    xboxIP?: string;
    xboxID?: string;
}