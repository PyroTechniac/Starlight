import { Gateway, Settings, KlasaGuild } from 'klasa';

export class MemberGateway extends Gateway {

	protected _synced = false;

	public get(id: string): Settings | null {
		const [guildID, memberID] = id.split('.');
		const guild = this.cache.get(guildID);
		if (!guild) return null;

		const member = guild.members.get(memberID);
		return (member && member.settings) || null;
	}

	public async sync(input: string): Promise<Settings>;
	public async sync(input?: string[]): Promise<this>;
	public async sync(input?: string[] | string): Promise<Settings | this> {
		const results = await super.sync(input);
		if (results === this) {
			for (const guild of this.cache.values() as IterableIterator<KlasaGuild>) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				for (const member of guild.members.values()) if (member.settings.existenceStatus === null) member.settings.existenceStatus = false;
			}
		}

		return results;
	}

}
