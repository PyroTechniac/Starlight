import { Command, CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['hb'],
            description: 'Upload code or text to hastebin.',
            usage: '<code:string>'
        });
    }

    public async run(msg: KlasaMessage, [code]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const key = await fetch('https://hastebin.com/documents', { method: 'POST', body: code })
            .then((res): any => res.json())
            .then((body): string => body.key);

        return msg.sendMessage(`https://hastebin.com/${key}`);
    }
}