import { Piece, PieceJSON, PieceOptions } from 'klasa';
import { readFile } from 'fs-nextra';
import { MessageAttachment } from 'discord.js';
import { assetsFolder } from '../util/Utils';

export abstract class Asset extends Piece {

	private raw: Buffer | null = null;

	public abstract get filepath(): string;

	public abstract get filename(): string;

	public get attachment(): MessageAttachment {
		if (this.raw === null) throw new Error('Cannot access file when asset isn\'t loaded');
		return new MessageAttachment(this.raw, this.filename);
	}

	public async init(): Promise<void> {
		this.raw = await readFile(this.filepath);
	}

	public toJSON(): PieceAssetJSON {
		return {
			...super.toJSON(),
			filename: this.filename,
			filepath: this.filepath
		};
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
