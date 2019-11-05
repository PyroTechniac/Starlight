import Collection from '@discordjs/collection';
import { Language } from 'klasa';
import { TranslationHelperJSON } from '../types/Interfaces';

export class TranslationHelper {

	public language: Language;

	private defaults: Collection<string, string>;

	private translations: Collection<string, string>;
	public constructor(lang: Language) {
		this.language = lang;
		this.translations = new Collection<string, string>();
		this.defaults = new Collection<string, string>();
	}

	private get lang(): string {
		return this.language.name;
	}

	public setTranslations(translations: [string, string][]): this {
		return this.setup(translations, 'translations');
	}

	public setDefaults(translations: [string, string][]): this {
		return this.setup(translations, 'defaults');
	}

	public get(key: string): string {
		const translation = this.translations.has(key) ? this.translations.get(key)! : this.defaults.has(key) ? this.defaults.get(key)! : key;
		return translation;
	}

	public toString(): string {
		return `TranslationHelper<${this.lang}>`;
	}

	public toJSON(): TranslationHelperJSON {
		const translations: Record<string, string> = {};
		const defaults: Record<string, string> = {};
		for (const [key, val] of this.translations) translations[key] = val;
		for (const [key, val] of this.defaults) defaults[key] = val;
		return {
			language: this.lang,
			translations,
			defaults
		};
	}

	private setup(translations: [string, string][], coll: 'translations' | 'defaults'): this {
		for (const translation of translations) {
			this[coll].set(...translation);
		}
		return this;
	}

}
