import { Monitor, MonitorStore, KlasaMessage } from 'klasa';

export default class extends Monitor {
    public constructor(store: MonitorStore, file: string[], directory: string) {
        super(store, file, directory, {
            ignoreOthers: false
        });
    }

    public async run(msg: KlasaMessage): Promise<null | KlasaMessage | boolean> {
        if (!msg.guild || !msg.guild.settings.get('antiinvite')) return null;
        if (await msg.hasAtLeastPermissionLevel(6)) return null;
        if (!/(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(msg.content)) return null;
        return (msg.delete() as Promise<KlasaMessage>)
            .catch((err): boolean => this.client.emit('error', err));
    }
}