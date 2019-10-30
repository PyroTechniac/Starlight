import { Structures } from 'discord.js';
import { Databases } from '../types/Enums';

export class StarlightMember extends Structures.get('GuildMember') {

	public settings = this.client.gateways.get(Databases.Members)!.acquire(this, [this.guild.id, this.id].join('.'));

	public toJSON(): object {
		return { ...super.toJSON(), settings: this.settings.toJSON() };
	}

}
