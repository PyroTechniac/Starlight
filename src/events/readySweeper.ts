import { Event, EventOptions, Colors } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { Events } from '../lib/types/Enums';


@ApplyOptions<EventOptions>({
	once: true,
	event: 'ready'
})
export default class extends Event {

	private header = new Colors({ text: 'lightblue' }).format('[MEMORY CLEANUP]');

	private colors = {
		red: new Colors({ text: 'lightred' }),
		yellow: new Colors({ text: 'lightyellow' }),
		green: new Colors({ text: 'green' })
	};

	public run(): void {
		this.client.emit(Events.Verbose, `${this.header} Running initial sweep...`);

		const users = this.client.users.size;
		let presences = 0;
		let guildMembers = 0;
		let emojis = 0;

		for (const user of this.client.users.values()) {
			this.client.usertags.set(user.id, user.tag);
		}

		this.client.users.clear();

		for (const guild of this.client.guilds.values()) {
			const { me } = guild;

			for (const member of guild.members.values()) {
				guild.memberSnowflakes.add(member.id);
			}

			guildMembers += guild.members.size - 1;
			presences += guild.presences.size;
			emojis += guild.emojis.size;

			guild.presences.clear();
			guild.emojis.clear();

			guild.members.clear();
			if (me) guild.members.set(me.id, me);
		}

		this.client.emit(Events.Verbose, `${this.header} ${
			this.setColor(presences)} [Presence]s | ${
			this.setColor(guildMembers)} [GuildMember]s | ${
			this.setColor(users)} [User]s | ${
			this.setColor(emojis)} [Emoji]s`);
	}

	private setColor(n: number): string {
		const text = String(n).padStart(5, ' ');

		if (n > 1000) return this.colors.red.format(text);
		if (n > 100) return this.colors.yellow.format(text);
		return this.colors.green.format(text);
	}

}
