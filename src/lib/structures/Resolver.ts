import { AliasPiece, AliasPieceOptions, constants, Language } from 'klasa';
import { ResolverStore } from './ResolverStore';
import { mergeDefault } from '@klasa/utils';

export abstract class Resolver extends AliasPiece {

	public constructor(store: ResolverStore, file: string[], directory: string, options: ResolverOptions = {}) {
		super(store, file, directory, mergeDefault({ aliases: [] as string[] }, options));
	}

	public static regex = constants.MENTION_REGEX;

	public abstract run(arg: string, language: Language, collectionOrArray: Map<unknown, unknown> | unknown[]): unknown;

}

export interface ResolverOptions extends AliasPieceOptions {}
