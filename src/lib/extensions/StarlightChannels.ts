import { CategoryChannel, GuildChannel, Structures, TextChannel, VoiceChannel } from 'discord.js';
import { Constructor } from '../types/Types';
import {ChannelGateway} from "../structures/ChannelGateway";

function AddSettings<T extends Constructor<GuildChannel>>(target: T): T {
	return class extends target {

		public settings = (this.client.gateways.get(`${this.type}Channels`) as ChannelGateway).acquire(this);

		public toJSON(): object {
			return { ...super.toJSON(), settings: this.settings.toJSON() };
		}

	} as T;
}

@AddSettings
export class StarlightTextChannel extends Structures.get('TextChannel') {}

@AddSettings
export class StarlightCategoryChannel extends Structures.get('CategoryChannel') {}

@AddSettings
export class StarlightVoiceChannel extends Structures.get('VoiceChannel') {}

Structures.extend('TextChannel', (): typeof TextChannel => StarlightTextChannel);
Structures.extend('CategoryChannel', (): typeof CategoryChannel => StarlightCategoryChannel);
Structures.extend('VoiceChannel', (): typeof VoiceChannel => StarlightVoiceChannel);

