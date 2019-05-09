import { Monitor, MonitorStore, KlasaClient, KlasaMessage } from 'klasa';

export default class InviteMonitor extends Monitor {
    public constructor(client: KlasaClient, store: MonitorStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            enabled: true,
            name: 'invitedetection',
            ignoreSelf: true,
            ignoreOthers: false
        });
    }

    public async run(msg: KlasaMessage): Promise<boolean | KlasaMessage | null> {
        if (!msg.guild || !msg.guild.settings.get('antiinvite')) return null;
        if (await msg.hasAtLeastPermissionLevel(6)) return null;
        if (!/(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(msg.content)) return null;
        try {
            return await msg.delete() as KlasaMessage;
        } catch (e) {
            this.client.emit('error', e);
            return null;
        }
    }
}