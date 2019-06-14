import { GuildMember, Structures } from 'discord.js';
import { Settings } from 'klasa';

class StarlightGuildMember extends (Structures.get('GuildMember') as typeof GuildMember) {
    public settings: Settings = this.client.gateways.get('members')!.acquire(this);

    public toJSON(): object {
        return { ...super.toJSON(), settings: this.settings.toJSON() };
    }
}

Structures.extend('GuildMember', (): typeof GuildMember => StarlightGuildMember);

export { StarlightGuildMember };
