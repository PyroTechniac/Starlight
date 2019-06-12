import { Collection, FetchMemberOptions, GuildMember, GuildMemberStore, Message, User } from 'discord.js';
import { Settings } from 'klasa';
import { StarlightGuildMember } from '../extensions/StarlightGuildMember';

declare module 'discord.js' {
    interface GuildMember {
        settings: Settings;
    }
}

export class StarlightGuildMemberStore extends GuildMemberStore {
    // @ts-ignore
    public async fetch(options: string | GuildMember | User | Message | FetchMemberOptions): Promise<StarlightGuildMember | Collection<string, StarlightGuildMember>> {
        const fetched = await super.fetch(options);
        if (fetched instanceof this.holds) await fetched.settings.sync();
        if (fetched instanceof Collection) {
            for (const member of fetched.values()) await member.settings.sync();
        }

        return fetched;
    }
}