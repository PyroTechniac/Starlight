import { MessageEmbed, version as discordVersion } from 'discord.js';
import { Duration, Task, util, version as klasaVersion } from 'klasa';
import { Events } from '../lib/types/Enums';
import { version } from '../../native';

export default class extends Task {

	public async run(): Promise<void> {
		const statsWebhook = this.client.webhooks.get('stats');
		if (!statsWebhook) return;

		let [users, guilds, channels, memory] = [0, 0, 0, 0];

		if (this.client.shard) {
			const results = await this.client.shard.broadcastEval('[this.users.size, this.guilds.size, this.channels.size, (process.memoryUsage().heapUsed / 1024 / 1024)]') as [number, number, number, number][];
			for (const result of results) {
				users += result[0];
				guilds += result[1];
				channels += result[2];
				memory += result[3];
			}
		} else {
			users = this.client.users.size;
			guilds = this.client.guilds.size;
			channels = this.client.channels.size;
			memory = process.memoryUsage().heapUsed;
		}

		const embed = new MessageEmbed()
			.setDescription(util.codeBlock('asciidoc', this.getDescription(
				(memory / 1024 / 1024).toFixed(2),
				Duration.toNow(Date.now() - (process.uptime() * 1000)),
				users.toLocaleString(),
				guilds.toLocaleString(),
				channels.toLocaleString()
			)))
			.setColor('GREEN')
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL());

		try {
			await statsWebhook.send(embed);
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

	private getDescription(memUsage: string, uptime: string, users: string, guilds: string, channels: string): string {
		return [
			'= STATISTICS =',
			'',
			`• Mem Usage  :: ${memUsage} MB`,
			`• Uptime     :: ${uptime}`,
			`• Users      :: ${users}`,
			`• Guilds     :: ${guilds}`,
			`• Channels   :: ${channels}`,
			`• Klasa      :: v${klasaVersion}`,
			`• Discord.js :: v${discordVersion}`,
			`• Node.js    :: ${process.version}`,
			`• Neon       :: v${version()}`,
			`• Shard      :: ${this.client.options.totalShardCount}`
		].join('\n');
	}

}
