import { Argument, KlasaGuild, KlasaMessage, Possible } from 'klasa';

export default class GuildArgument extends Argument {
	public run(arg: string, possible: Possible, message: KlasaMessage): KlasaGuild {
		const guild = (this.constructor as typeof Argument).regex.snowflake.test(arg) ? this.client.guilds.get(arg) : null;
		if (guild) return guild;
		throw message.language.get('RESOLVER_INVALID_GUILD', possible.name);
	}
}