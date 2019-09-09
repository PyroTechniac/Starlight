import { Structures, GuildMember } from 'discord.js';

class StarlightMember extends Structures.get('GuildMember') {

	public settings = this.client.gateways.get('members')!.acquire(this, `${this.guild.id}.${this.id}`);

	public toJSON(): object {
		return { ...super.toJSON(), settings: this.settings.toJSON() };
	}

}

Structures.extend('GuildMember', (): typeof GuildMember => StarlightMember);
export { StarlightMember };
