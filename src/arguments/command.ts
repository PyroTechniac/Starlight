import { Argument, ArgumentStore, Command, KlasaClient, KlasaMessage, Possible } from 'klasa';

export default class CommandArgument extends Argument {
    public constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['cmd']
        });
    }

    public run(arg: string, possible: Possible, message: KlasaMessage): Command {
        const command = this.client.commands.get(arg.toLowerCase());
        if (command) return command;
        throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'command');
    }
}