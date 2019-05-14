import { MultiArgument, Argument, KlasaClient, ArgumentStore } from 'klasa'

export default class MultiGuildArgument extends MultiArgument {
	public constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string) {
		super(client, store, file, directory, { aliases: ['...guild'] })
	}

	public get base(): Argument {
		return this.store.get("guild")
	}
}