import { AliasStore, KlasaClient, Language } from 'klasa';
import { Resolver } from './Resolver';

export class ResolverStore extends AliasStore<string, Resolver, typeof Resolver> {

	public constructor(client: KlasaClient) {
		super(client, 'resolvers', Resolver);
	}

	public async run<T>(name: string, arg: string, language: Language, coll: Map<unknown, T> | T[]): Promise<T | null> {
		const resolver = this.get(name.toLowerCase());
		if (!resolver) return null;

		const resolved: T | null = await resolver.run(arg, language, coll) as T | null;

		return resolved;
	}

}
