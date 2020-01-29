import { DocEntries } from '../DocEntries';
import { MessageEmbed } from 'discord.js';

export abstract class BaseEntry {

	public constructor(public readonly entries: DocEntries, public readonly name: string, data: unknown) {
		this._patch(data);
	}

	public abstract get url(): string;

	public abstract generateEmbed(): MessageEmbed;

	protected abstract _patch(data: unknown): void;

}
