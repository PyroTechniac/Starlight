import { AliasStore, KlasaClient, Language } from 'klasa';
import { Resolver, ResolverContext } from './Resolver';
import { noop } from '../util/Utils';
import { Guild } from 'discord.js';
import { isObject } from '@klasa/utils';

export class ResolverStore extends AliasStore<string, Resolver, typeof Resolver> {

	public constructor(client: KlasaClient) {
		super(client, 'resolvers', Resolver);
	}

	public async run<V>(name: string, arg: string, language: Language, guild: Guild): Promise<V | null>;
	public async run<V>(name: string, context: Omit<ResolverContext, 'type'>): Promise<V | null>;
	public async run<V>(name: string, ctx: string | Omit<ResolverContext, 'type'>, language?: Language, guild?: Guild): Promise<V | null> {
		const resolver = this.get(name.toLowerCase());
		if (typeof resolver === 'undefined') return null;

		const resolved: V | null = await resolver.run(this.resolveContext(name, ctx, language, guild)).catch(noop) as V | null;
		return resolved;
	}

	public resolveContext(name: string, ctx: string | Omit<ResolverContext, 'type'>, language?: Language, guild?: Guild): ResolverContext {
		if (typeof ctx === 'string' && language && guild) return { arg: ctx, language, guild, type: name };
		else if (isObject(ctx)) return { ...ctx as Omit<ResolverContext, 'type'>, type: name };
		throw new Error('Failed to create ResolverContext.');
	}

}
