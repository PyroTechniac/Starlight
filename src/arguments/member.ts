import { Argument, Possible, KlasaMessage } from 'klasa';
import { GuildMember, TextChannel } from 'discord.js';
import { Util } from '../lib';

const { userOrMember } = Argument.regex;

export default class extends Argument {
    public async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<GuildMember> {
        let member: GuildMember | null = null;

        if (msg.guild) {
            if (arg.trim().toLowerCase() === '@someone') {
                member = (msg.channel as TextChannel).members.random() || null;
            } else if (userOrMember.test(arg)) {
                member = await msg.guild.members.fetch(userOrMember.exec(arg)![1]).catch(Util.noop);
            }
        }

        if (member) return member;

        throw msg.language.get('RESOLVER_INVALID_MEMBER', possible.name);
    }
}