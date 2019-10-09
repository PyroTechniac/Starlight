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
		const translation = this.translations.has(key) ? this.translations.get(key)! : this.defaults.has(key) ? this.defaults.get(key)! : null;

		if (!translation) throw `The key '${key}' has not been translated for ${this.lang}`;
		return translation;
	}

	public toString(): string {
		return `TranslationHelper<${this.lang}>`;
	}

	public toJSON(): TranslationHelperJSON {
		return {
			language: this.lang,
			translations: this.translations.reduce((prev, [key, val]): Record<string, string> => ({ [key]: val, ...prev }), {}),
			defaults: this.defaults.reduce((prev, [key, val]): Record<string, string> => ({ [key]: val, ...prev }), {})
		};
	}

	private setup(translations: [string, string][], coll: 'translations' | 'defaults'): this {
		for (const translation of translations) {
			this[coll].set(...translation);
		}
		return this;
	}

}
