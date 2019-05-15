import { Command, util, CommandStore, Client, KlasaMessage } from 'klasa'
import fetch from 'node-fetch'

const ZWS = '\u200B';

export default class UrbanCommand extends Command {
	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['urban-dictionary', 'ub'],
			requiredPermissions: ['EMBED_LINKS'],
			description: "Searches the Urban Dictionary library for a definition to the search term",
			usage: '<query:string> [page:integer{0,10}]',
			usageDelim: ' ',
			nsfw: true
		})
	}

	public async run(msg: KlasaMessage, [query, ind = 1]: [string, number]): Promise<KlasaMessage | KlasaMessage[]> {
		const index = ind = 1;
		if (index < 0) {
			throw 'The number cannot be zero or negative';
		}

		const response = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`)
		const { list } = await response.json();

		const result = list[index];
		if (typeof result === 'undefined') {
			// @ts-ignore
			throw index === 0 ?
				'I could not find this entry in UrbanDictionary' :
				'I could not find this page in UrbanDictionary, try a lower page index';
		}	
	}
}