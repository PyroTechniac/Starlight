import { Monitor, MonitorStore } from 'klasa';
import { StarlightMessage } from '../lib/extensions/StarlightMessage';
import { Util } from '../lib/util';

export default class extends Monitor {
    public constructor(store: MonitorStore, file: string[], directory: string) {
        super(store, file, directory, {
            name: 'invitedetection',
            enabled: true,
            ignoreSelf: true
        });
    }

    public async run(msg: StarlightMessage): Promise<StarlightMessage | null> {
        if (!msg.guild || !msg.guild.settings.get('antiinvite') as boolean) return null;
        if (await msg.hasAtLeastPermissionLevel(6)) return null;
        if (!/(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(msg.content)) return null;
        return (msg.delete() as Promise<StarlightMessage>)
            .catch(Util.noop);
    }
}