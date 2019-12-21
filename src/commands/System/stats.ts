import { StarlightCommand, StarlightCommandOptions } from '../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../lib/util/Decorators';
import { StatsGeneral, StatsUptime, StatsUsage } from '../../lib/types/Interfaces';
import { version as VERSION } from 'discord.js';
import { Duration, KlasaMessage } from 'klasa';
import { loadavg, uptime } from 'os';

@ApplyOptions<StarlightCommandOptions>({
	aliases: ['stats', 'sts'],
	bucket: 2,
	cooldown: 15,
	description: (lang): string => lang.get('COMMAND_STATS_DESCRIPTION'),
	extendedHelp: (lang): string => lang.get('COMMAND_STATS_EXTENDED')
})
export default class extends StarlightCommand {

	private get STATS(): StatsGeneral {
		return {
			CHANNELS: this.client.channels.size.toLocaleString(),
			GUILDS: this.client.guilds.size.toLocaleString(),
			NODE_JS: process.version,
			USERS: this.client.guilds.reduce((a, b): number => a + b.memberCount, 0).toLocaleString(),
			VERSION
		};
	}

	private get UPTIME(): StatsUptime {
		const now = Date.now();
		return {
			CLIENT: Duration.toNow(now - this.client.uptime!, false),
			HOST: Duration.toNow(now - (uptime() * 1000), false),
			TOTAL: Duration.toNow(now - (process.uptime() * 1000), false)
		};
	}

	private get USAGE(): StatsUsage {
		return {
			CPU_LOAD: `${Math.round(loadavg()[0] * 100) / 100}%`,
			RAM_TOTAL: `${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
			RAM_USED: `${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`
		};
	}

	public async run(message: KlasaMessage): Promise<KlasaMessage> {
		return message.sendLocale('COMMAND_STATS', [this.STATS, this.UPTIME, this.USAGE], { code: 'asciidoc' });
	}

}
