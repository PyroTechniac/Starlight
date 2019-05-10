import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib';

export default class AutoplayCommand extends MusicCommand {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            description: 'Toggle the autoplayer',
            requireMusic: true
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const { music } = msg.guild!;
        const enabled = !music.autoplay;

        music.autoplay = enabled;

        return msg.send(enabled ?
            'Sure thing! Autoplay is now enabled, so I won\'t stop playing music'
            : 'Alright! I\'ve stopped autoplaying tracks');
    }
}