import { GuildMember, Structures } from 'discord.js';
import {MemberGateway} from "../structures/MemberGateway";

export class StarlightGuildMember extends Structures.get('GuildMember') {

	public settings = (this.client.gateways.get('members') as MemberGateway).acquire(this, `${this.guild.id}.${this.id}`);

	public toJSON(): object {
		return { ...super.toJSON(), settings: this.settings.toJSON() };
	}

}

Structures.extend('GuildMember', (): typeof GuildMember => StarlightGuildMember);
