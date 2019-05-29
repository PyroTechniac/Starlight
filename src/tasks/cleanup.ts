import { DMChannel, SnowflakeUtil, TextChannel } from 'discord.js';
import { Colors, Task, TaskStore } from 'klasa';

const { generate } = SnowflakeUtil;

const THRESHOLD: number = 1000 * 60 * 30;

export default class CleanupTask extends Task {
    private colors: { [key: string]: Colors } = {
        red: new Colors({ text: 'lightred' }),
        yellow: new Colors({ text: 'lightyellow' }),
        green: new Colors({ text: 'green' })
    }

    private header: string = new Colors({ text: 'lightblue' }).format('[CACHE CLEANUP]')
    public constructor(store: TaskStore, file: string[], directory: string) {
        super(store, file, directory, {
            enabled: false
        });
    }

    public async run(): Promise<void> {
        this.client.emit('verbose', `${this.header} Starting cleanup...`);
        const OLD_SNOWFLAKE = generate(Date.now() - THRESHOLD);
        let presences = 0, guildMembers = 0, voiceStates = 0, emojis = 0, lastMessages = 0, users = 0;

        for (const guild of this.client.guilds.values()) {
            presences += guild.presences.size;
            guild.presences.clear();
            // @ts-ignore
            voiceStates += guild.voiceStates.size;
            // @ts-ignore
            guild.voiceStates.clear();

            const { me } = guild;
            for (const [id, member] of guild.members) {
                if (member === me) continue;
                if (member.voice.channelID) continue;
                if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
                guildMembers++;
                guild.members.delete(id);
            }

            emojis += guild.emojis.size;
            guild.emojis.clear();
        }

        for (const channel of this.client.channels.values()) {
            if (!(['text', 'dm'].includes(channel.type))) continue;
            if (!(channel as TextChannel | DMChannel).lastMessageID) continue;
            (channel as TextChannel | DMChannel).lastMessageID = null;
            lastMessages++;
        }

        for (const user of this.client.users.values()) {
            if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
            this.client.users.delete(user.id);
            users++;
        }

        this.client.emit('verbose',
            `${this.header} ${
                this.setColor(presences)} [Presence]s | ${
                this.setColor(guildMembers)} [GuildMember]s | ${
                this.setColor(voiceStates)} [VoiceState]s | ${
                this.setColor(users)} [User]s | ${
                this.setColor(emojis)} [Emoji]s | ${
                this.setColor(lastMessages)} [Last Message]s.`);
    }

    private setColor(num: number): string {
        const text = String(num).padStart(5, ' ');
        if (num > 1000) return this.colors.red.format(text);

        if (num > 100) return this.colors.yellow.format(text);

        return this.colors.green.format(text);
    }
}