import { Command, CommandStore, Duration } from 'klasa';
import { Language } from 'klasa';
import { KlasaMessage } from 'klasa';
import { ShardClientUtil } from 'kurasuta';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            guarded: true,
            aliases: ['status'],
            description: (language: Language): string => language.get('COMMAND_STATS_DESCRIPTION'),
            requiredPermissions: ['EMBED_LINKS']
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        let [users, guilds, channels, memory] = [0, 0, 0, 0];

        const results = await (this.client.shard as unknown as ShardClientUtil).broadcastEval<[number, number, number, number]>('[this.guilds.reduce((prev, val) => val.memberCount + prev, 0), this.guilds.size, this.channels.size, (process.memoryUsage().heapUsed / 1024 / 1024)]');
        for (const result of results) {
            users += result[0];
            guilds += result[1];
            channels += result[2];
            memory += result[3];
        }

        const shardID = msg.guild ? msg.guild.shardID + 1 : 1;
        const embed = this.client.util.embed()
            .setColor('RANDOM')
            .setTimestamp()
            .setThumbnail('https://i.imgur.com/HE0ZOSA.png')
            .addField('❯ Memory Usage', `${memory.toFixed(2)} MB`, true)
            .addField('❯ Uptime', Duration.toNow(Date.now() - (process.uptime() * 1000)), true)
            .addField('❯ Users', users.toLocaleString(), true)
            .addField('❯ Guilds', guilds.toLocaleString(), true)
            .addField('❯ Channels', channels.toLocaleString(), true)
            .addField('❯ Sharding', `**Cluster:** ${(this.client.shard as unknown as ShardClientUtil).id + 1} / ${(this.client.shard as unknown as ShardClientUtil).clusterCount} | **Shard:** ${shardID} / ${(this.client.shard as unknown as ShardClientUtil).shardCount}`, true)
            .setAuthor(`${this.client.user!.tag} - Statistics`, this.client.user!.displayAvatarURL());

        return msg.sendEmbed(embed);
    }
}