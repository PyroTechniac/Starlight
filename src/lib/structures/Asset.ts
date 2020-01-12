import { Piece, PieceOptions } from 'klasa';
import { readFile } from 'fs-nextra';
import { MessageAttachment } from 'discord.js';
import { assetsFolder } from '../util/Utils';

export abstract class Asset extends Piece {

	private raw: Buffer | null = null;

	public abstract get filePath(): string;

	public abstract get fileName(): string;

	public get attachment(): MessageAttachment {
		if (this.raw === null) throw new Error('Cannot access file when asset isn\'t loaded');
		return new MessageAttachment(this.raw, this.fileName);
	}

	public async init(): Promise<void> {
		this.raw = await readFile(this.filePath);
	}

	protected static makePath(...path: string[]): string {
		return assetsFolder(...path);
	}

}

export interface AssetOptions extends PieceOptions {
	fileName?: string;
}
