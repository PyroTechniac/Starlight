import { Settings } from 'klasa';
import { Structures, GuildMember } from 'discord.js';

class StarlightGuildMember extends (Structures.get('GuildMember') as typeof GuildMember) {
    public settings: Settings = this.client.gateways.get('members')!.acquire(this);

    public toJSON(): object {
        return { ...super.toJSON(), settings: this.settings.toJSON() };
    }
}

Structures.extend('GuildMember', (): typeof GuildMember => StarlightGuildMember);

export { StarlightGuildMember };