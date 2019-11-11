import { Piece, PieceOptions } from 'klasa';
import { readFile } from 'fs-nextra';
import { assetsFolder } from '../util/Utils';
import { MessageAttachment } from 'discord.js';
import { AssetStore } from './AssetStore';
import { mergeDefault } from '@klasa/utils';

export abstract class Asset extends Piece {

	public buffer: Buffer | null = null;
	public extension: string;

	public constructor(store: AssetStore, file: string[], directory: string, options: AssetOptions = {}) {
		super(store, file, directory, mergeDefault({ enabled: true, extension: 'png' }, options));

		this.extension = options.extension!;
	}

	public abstract get filePath(): string;

	public get fullName(): string {
		return `${this.name}.${this.extension}`;
	}

	public get attachment(): MessageAttachment {
		if (!this.buffer) throw new Error('Cannot create attachment for unloaded buffer');
		return new MessageAttachment(this.buffer, this.fullName);
	}

	public async init(): Promise<void> {
		await this.load();
	}

	private load(force = this.buffer === null): Promise<Asset> {
		const loadStatus = Asset.loadMap.get(this);

		if (!force || loadStatus) return loadStatus || Promise.resolve(this);

		const load = readFile(this.filePath)
			.then((data): this => {
				this.buffer = data;
				return this;
			})
			.finally((): boolean => Asset.loadMap.delete(this));

		Asset.loadMap.set(this, load);
		return load;
	}

	public static loadMap: WeakMap<Asset, Promise<Asset>> = new WeakMap();

	public static assetsFolder(...paths: string[]): string {
		return assetsFolder(...paths);
	}

}

export interface AssetOptions extends PieceOptions {
	extension?: string;
}
