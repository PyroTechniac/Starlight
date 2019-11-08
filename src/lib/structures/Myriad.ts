import { Client } from 'discord.js';
import fetch from 'node-fetch';
import {ParsedMyriadContent} from "../types/Interfaces";

const entries: [string, string[]][] = [
	['apl', ['apl']],
	['bash', ['bash', 'sh']],
	['brainfuck', ['brainfuck', 'bf']],
	['c', ['c']],
	['clojure', ['clojure', 'clj']],
	['cpp', ['cpp']],
	['csharp', ['csharp', 'cs']],
	['elixir', ['elixir']],
	['fsharp', ['fsharp', 'fs']],
	['go', ['golang', 'go']],
	['haskell', ['haskell', 'hs']],
	['idris', ['idris', 'idr']],
	['java', ['java']],
	['javascript', ['javascript', 'js']],
	['julia', ['julia']],
	['lua', ['lua']],
	['ocaml', ['ocaml', 'ml']],
	['pascal', ['pascal', 'pas', 'freepascal']],
	['perl', ['perl', 'pl']],
	['php', ['php']],
	['prolog', ['prolog']],
	['python', ['python', 'py']],
	['racket', ['lisp']],
	['ruby', ['ruby', 'rb']],
	['rust', ['rust', 'rs']]
];

export class Myriad {

	public readonly client!: Client;
	public enabled: boolean;
	public port: number;
	private readonly regex: RegExp = /^\s*(`{1,3})(.+?)[ \n]([^]+)\1\s*$/;

	public constructor(client: Client) {
		if (!Myriad.initialized) Myriad.init();
		Object.defineProperty(this, 'client', { value: client });

		this.enabled = this.client.options.myriad.enabled!;

		this.port = this.client.options.myriad.port!;
	}
	
	public parse(content: string): null | ParsedMyriadContent {
		const match = content.match(this.regex);
		if (!match) return null;
		const language = Myriad.Aliases.get(match[2].toLowerCase());
		if (!language) return null;
		const code = match[3].trim();
		return {language, code}
	}

	public async eval(content: string): Promise<[boolean, string]> {
		const parsed = this.parse(content);
		if (!parsed) return [false, 'Parsing failed'];
		const {language, code} = parsed;
		const response = await fetch(this.url('eval'), {
			method: 'POST',
			body: JSON.stringify({ language, code }),
			headers: { 'Content-Type': 'application/json' }
		});

		if (!response.ok) {
			const { status } = response;
			const text = await response.text();
			if (status === 404 && text === `Language ${language} was not found`) {
				return [false, `Invalid language ${language}`];
			}

			if (status === 500 && text === 'Evaluation failed') {
				return [false, 'Evaluation failed'];
			}

			if (status === 504 && text === 'Evaluation timed out') {
				return [false, 'Evaluation timed out'];
			}

			throw new Error(`Unexpected ${response.status} response from Myriad, ${response.statusText}`);
		}

		const body = await response.json();
		return [true, body.result || '\n'];
	}

	public async languages(): Promise<string[]> {
		return (await this.client.cdn.acquire(this.url('languages'))
			.setOptions({
				method: 'GET'
			})
			.fetch())
			.data<string[]>()!;
	}

	public async cleanup(): Promise<string[]> {
		return (await this.client.cdn.acquire(this.url('cleanup'))
			.setOptions({
				method: 'POST'
			})
			.fetch(true))
			.data<string[]>()!;
	}

	private url(k: string): string {
		return `http://localhost:${this.port}/${k}`;
	}

	public static Languages = new Map<string, string[]>(entries);
	public static Aliases = new Map<string, string>();
	private static initialized = false;

	public static init(): void {
		for (const [l, xs] of entries) {
			for (const x of xs) {
				Myriad.Aliases.set(x, l);
			}
		}
		this.initialized = true;
	}

}
