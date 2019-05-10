import { KlasaClient, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../lib';

export default class RequireMusicInhibitor extends Inhibitor {
    public constructor(client: KlasaClient, store: InhibitorStore, file: string[], directory: string) {
        super(client, store, file, directory, { spamProtection: true });
    }

    public async run(msg: KlasaMessage, cmd: MusicCommand): Promise<void> {
        if (cmd.requireMusic !== true) return;

        if (msg.channel.type !== 'text') throw 'This command may only be executed in a server';

        if (!msg.member!.voice.channel) throw 'You are not connected to a voice channel';
        if (!msg.guild!.me!.voice.channel) throw 'I am not connected to a voice channel';
        if (msg.member!.voice.channel !== msg.guild!.me!.voice.channel) throw 'You must be in the same voice channel as me';	
    }
}