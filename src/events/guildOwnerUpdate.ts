import { Event, EventOptions, KlasaGuild } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { GuildSettings } from '../lib/settings/GuildSettings';

@ApplyOptions<EventOptions>({
	event: 'guildUpdate'
})
export default class extends Event {

	public async run(oldGuild: KlasaGuild, newGuild: KlasaGuild): Promise<void> {
		if (oldGuild.ownerID === newGuild.ownerID) return;

		await newGuild.settings.update(GuildSettings.Owner, newGuild.ownerID, { throwOnError: true });
	}

}
