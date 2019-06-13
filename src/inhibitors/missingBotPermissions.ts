import { BitField, Permissions, PermissionString } from 'discord.js';
import { Command, Inhibitor, KlasaMessage, util } from 'klasa';
import { StarlightTextChannel } from '../lib';
const { FLAGS } = Permissions;

export default class extends Inhibitor {
    private impliedPermissions: Readonly<BitField<PermissionString>> = new Permissions(515136).freeze();

    private friendlyPerms: Record<string, string> = Object.keys(FLAGS).reduce<Record<string, string>>((obj, key): Record<string, string> => {
        obj[key] = util.toTitleCase(key.split('_').join(' '));
        return obj;
    }, {});

    public run(message: KlasaMessage, command: Command): void {
        const missing = message.channel.type === 'text' ?
            (message.channel as StarlightTextChannel).permissionsFor(this.client.user!)!.missing(command.requiredPermissions, false) :
            this.impliedPermissions.missing(command.requiredPermissions, false);

        if (missing.length) throw message.language.get('INHIBITOR_MISSING_BOT_PERMS', missing.map((key): string => this.friendlyPerms[key]).join(', '));
    }
}