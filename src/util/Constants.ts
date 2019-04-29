import { ConfigOptions } from './Config';
import { Constructable } from 'discord.js';

export interface AnyObj {
    [key: string]: any;
}

export const DefaultEmbedColor: [number, number, number] = [132, 61, 164];

export const DefaultConfigOptions: ConfigOptions = {
    token: '',
    prefix: 's!'
};

