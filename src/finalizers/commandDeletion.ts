import { Collection, Message, MessageReaction, TextChannel } from 'discord.js';
import { Command, Finalizer, KlasaMessage, KlasaUser, Stopwatch, util } from 'klasa';
const { isThenable } = util;

export default class extends Finalizer {
    public async run(message: KlasaMessage, command: Command, response: any, timer: Stopwatch): Promise<void> {
        if (!response) return;
        if (!message.guild) return;
        if (isThenable(response)) response = await response;
        if (!(response instanceof Message)) return;

        if (!message.settings.get('deleteCommand')) return;

        if (!response.deletable || !response.reactable) return;

        if (!command.deletable) return;

        if (!((response.channel as TextChannel).permissionsFor(response.guild!.me!)!.has('MANAGE_MESSAGES'))) return;

        await response.react('🗑');
        let react: Collection<string, MessageReaction>;

        try {
            react = await response.awaitReactions(
                (reaction: MessageReaction, user: KlasaUser): boolean => reaction.emoji.name === '🗑' && user.id === message.author!.id,
                { max: 1, time: 5000, errors: ['time'] }
            );
        } catch {
            await response.reactions.removeAll();

            return;
        }

        react!.first()!.message.delete();
    }
}