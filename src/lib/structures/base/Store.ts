import { Collection } from 'discord.js';
import { Piece } from './Piece';
import { Constructor } from '../../interfaces';
import { StarlightClient } from '../../Client';

export abstract class Store<K, V extends Piece, VConstructor = Constructor<V>> extends Collection<K, V> {
    public readonly client: StarlightClient;
    public readonly name: string;
    public readonly holds: VConstructor;
    private readonly coreDirectories: Set<string>
    public constructor(client: StarlightClient, name: string, holds: VConstructor) {
        super();

        Object.defineProperty(this, 'client', { value: client });

        Object.defineProperty(this, 'name', { value: name });

        Object.defineProperty(this, 'holds', { value: holds });

        Object.defineProperty(this, 'coreDirectories', { value: new Set() });
    }
}