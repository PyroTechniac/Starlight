import { AliasPiece, AliasPieceOptions, constants, Language } from 'klasa';

export abstract class Resolver extends AliasPiece {

	public static regex = constants.MENTION_REGEX;

	public abstract run(arg: string, language: Language, collectionOrArray: Map<unknown, unknown> | unknown[]): unknown;

}

export interface ResolverOptions extends AliasPieceOptions {}
