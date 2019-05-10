import { MusicCommand } from '../../lib';
import { Permissions, VoiceChannel } from 'discord.js';
const { FLAGS } = Permissions;
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';

export default class JoinCommand extends MusicCommand {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['connect'],
            description: 'Joins the message author\'s voice channel'
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        if (!msg.member) {
            await this.client.util.fetchMember(msg.guild!, msg.author!.id, true).catch((): void => {
                throw 'I am sorry, but Discord didn\'t provide me with the information I need';
            });
        }

        const { channel } = msg.member!.voice;
        if (!channel) throw 'You are not in a voice channel';
        if (msg.guild!.music.playing) {
            const currentVoiceChannel = msg.guild!.music.voiceChannel;
            if (currentVoiceChannel!.id === channel!.id) throw 'I am already playing music there';
            throw 'Someone is already playing music here, why don\'t you hop in and listen?';
        }
        this.resolvePermissions(msg, channel);

        await msg.guild!.music.join(channel);
        return msg.send(`Successfully joined the voice channel ${channel}`);
    }

    private resolvePermissions(msg: KlasaMessage, voiceChannel: VoiceChannel): void {
        if (voiceChannel.full) throw 'Your voice channel is full, and I am unable to join';

        const perms = voiceChannel.permissionsFor(msg.guild!.me!);
        if (!perms!.has(FLAGS.CONNECT)) throw 'I am unable to join your voice channel, as I am missing the `CONNECT` permission';
        if (!perms!.has(FLAGS.SPEAK)) throw 'I am unable to play music, as I am missing the `SPEAK` permission';

    }
}