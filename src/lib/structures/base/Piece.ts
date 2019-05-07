import { Util } from '../../util';
import { join } from 'path';
import { StarlightClient } from '../../Client';
import { Store } from './Store';
import { PieceOptions } from '../../interfaces';
const { mergeDefault } = Util;

export class Piece {
    public enabled: boolean;
    public name: string;
    public constructor(public client: StarlightClient, public store: Store, public file: string[], public directory: string, options: PieceOptions = {}) {
        this.name = options.name || file[file.length - 1].slice(0, -3);

        this.enabled = Boolean(options.enabled);
    }

    public get type(): string {
        return this.store.name.slice(0, -1);
    }

    public get path(): string {
        return join(this.directory, ...this.file);
    }

    public async reload(): Promise<Piece | null> {
        const piece = this.store.load(this.directory, this.file);
        await piece!.init();
        if (this.client.listenerCount('pieceReloaded')) this.client.emit('pieceReloaded', piece);
        return piece;
    }

    public unload(): void {
        if (this.client.listenerCount('pieceUnloaded')) this.client.emit('pieceUnloaded', this);
        this.store.delete(this);
    }

    public disable(): this {
        if (this.client.listenerCount('pieceDisabled')) this.client.emit('pieceDisabled', this);
        this.enabled = false;
        return this;
    }

    public enable(): this {
        if (this.client.listenerCount('pieceEnabled')) this.client.emit('pieceEnabled', this);
        this.enabled = true;
        return this;
    }

    public async init(): Promise<any> {
        // Optionally defined in child classes
    }

    public toString(): string {
        return this.name;
    }

    public toJSON(): Record<string, any> {
        return {
            directory: this.directory,
            file: this.file,
            path: this.path,
            name: this.name,
            type: this.type,
            enabled: this.enabled
        };
    }
}