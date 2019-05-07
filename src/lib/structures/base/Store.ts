import { Collection } from 'discord.js';
import { join, extname, relative, sep } from 'path';
import { Util } from '../../util';
import { StarlightClient } from '../../Client';
import { Piece } from './Piece';
import * as fs from 'fs-nextra';
const { isClass } = Util;

export class Store extends Collection<string, Piece> {
    public readonly client: StarlightClient;
    public readonly name: string;
    public readonly holds: typeof Piece;
    public readonly coreDirectories: Set<string>
    public constructor(client: StarlightClient, name: string, holds: typeof Piece) {
        super();

        Object.defineProperty(this, 'client', { value: client });

        Object.defineProperty(this, 'name', { value: name });

        Object.defineProperty(this, 'holds', { value: holds });

        Object.defineProperty(this, 'coreDirectories', { value: new Set() });
    }

    public get userDirectory(): string {
        return join(this.client.userBaseDirectory, this.name);
    }

    protected registerCoreDirectory(directory: string): this {
        this.coreDirectories.add(directory + this.name);
        return this;
    }

    public init(): Promise<any[]> {
        return Promise.all(this.map((piece): any => piece.enabled ? piece.init() : piece.unload()));
    }

    public load(directory: string, file: string[]): Piece | null {
        const loc = join(directory, ...file);
        let piece: Piece | null = null;
        try {
            const Piece = ((req): any => req.default || req)(require(loc));
            if (!isClass(Piece)) throw new TypeError('The exported structure is not a class');
            piece = this.set(new Piece(this.client, this, file, directory));
        } catch (error) {
            if (this.client.listenerCount('wtf')) this.client.emit('wtf', `Failed to load file '${loc}'. Error:\n${error.stack || error}`);
        }
        delete require.cache[loc];
        module.children.pop();
        return piece;
    }

    public async loadAll(): Promise<number> {
        this.clear();
        return 4;
    }

    // @ts-ignore
    public set(piece: Piece): Piece | null {
        if (!(piece instanceof this.holds)) this.client.emit('error', `Only ${this} may be stored in this store`);
        const existing = this.get(piece.name);
        if (existing) this.delete(existing);
        else if (this.client.listenerCount('pieceLoaded')) this.client.emit('pieceLoaded', piece);
        super.set(piece.name, piece);
        return piece;
    }

    public delete(name: Piece | string): boolean {
        const piece = this.resolve(name);
        if (!piece) return false;
        super.delete(piece.name);
        return true;
    }

    public resolve(name: Piece | string): Piece | undefined {
        if (name instanceof this.holds) return name;
        return this.get(name);
    }

    public toString(): string {
        return this.name;
    }

    private static async walk(store: Store, directory: string = store.userDirectory): Promise<Piece[] | boolean> {
        const files = await fs.scan(directory, { filter: (stats, path): boolean => stats.isFile() && ['.js', '.ts'].includes(extname(path)) })
            .catch((): void => { if (store.client.options.createPiecesFolders) fs.ensureDir(directory).catch((err): boolean => store.client.emit('error', err)) })
        if (!files) return true;

        return Promise.all([...files.keys()].map((file): Piece | null=> store.load(directory, relative(directory, file).split(sep))))
    }
}