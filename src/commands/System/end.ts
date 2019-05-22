import { Command, CommandStore, KlasaMessage } from 'klasa';

export default class EndCommand extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 10,
            description: 'Ends the bots process.',
        });
    }

    public async run(msg: KlasaMessage): Promise<null> {
        await msg.send('Ending process');
        await this.client.destroy();
        return process.exit(0);
    }
}