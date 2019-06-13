import { Command, CommandStore, KlasaMessage, Language } from 'klasa';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            guarded: true,
            description: (language: Language): string => language.get('COMMAND_PING_DESCRIPTION')
        });
    }

    public async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const msg = await message.sendLocale('COMMAND_PING') as KlasaMessage;
        return message.sendLocale('COMMAND_PINGPONG', [(msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp), Math.round(this.client.ws.ping)]);
    }
}