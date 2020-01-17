import { Piece, PieceJSON, PieceOptions } from 'klasa';
import { readFile } from 'fs-nextra';
import { MessageAttachment } from 'discord.js';
import { assetsFolder, noop } from '../util/Utils';

export abstract class Asset extends Piece {

	private raw: Buffer | null = null;

	private initialized = false;

	public abstract get filepath(): string;

	public abstract get filename(): string;

	public get attachment(): MessageAttachment {
		if (this.raw === null) {
			throw new Error(this.initialized ? 'Failed to load asset.' : 'Asset has not been loaded.');
		}
		return new MessageAttachment(this.raw, this.filename);
	}

	public async init(): Promise<void> {
		this.initialized = true;
		this.raw = await readFile(this.filepath).catch(noop);
	}

	public toJSON(): PieceAssetJSON {
		return {
			...super.toJSON(),
			filename: this.filename,
			filepath: this.filepath
		};
	}

	public static get basePath(): string {
		return this.makePath();
	}

	protected static makePath(...path: string[]): string {
		return assetsFolder(...path);
	}

}

export interface AssetOptions extends PieceOptions {
}

export interface PieceAssetJSON extends PieceJSON {
	filename: string;
	filepath: string;
}
