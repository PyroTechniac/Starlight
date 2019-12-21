import { AliasPiece, AliasPieceOptions, constants, Language } from 'klasa';
import { Guild } from 'discord.js';

export abstract class Resolver<V = unknown> extends AliasPiece {

	public abstract async run(context: ResolverContext): Promise<V | null>;

	public static regex = constants.MENTION_REGEX;

}

export interface ResolverOptions extends AliasPieceOptions {
}

export interface ResolverContext {
	language: Language;
	arg: string;
	type: string;
	guild: Guild | null;
}
