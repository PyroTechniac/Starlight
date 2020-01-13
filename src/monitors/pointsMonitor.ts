import { KlasaMessage, Monitor, RateLimitManager, MonitorOptions } from 'klasa';
import { UserSettings } from '../lib/settings/UserSettings';
import { MemberSettings } from '../lib/settings/MemberSettings';
import { Events } from '../lib/types/Enums';
import { ApplyOptions } from '../lib/util/Decorators';

@ApplyOptions<MonitorOptions>({
	ignoreOthers: false
})
export default class extends Monitor {

	private readonly kRateLimits: RateLimitManager = new RateLimitManager(1, 60000);

	public async run(message: KlasaMessage): Promise<void> {
		try {
			this.kRateLimits.acquire(message.author.id).drip();
		} catch {
			return;
		}

		await Promise.all([
			message.author.settings.sync(),
			message.member!.settings.sync()
		]);

		try {
			const add = Math.round((Math.random() * 4) + 4);
			await message.author.settings.increase(UserSettings.Points, add);
			await message.member!.settings.increase(MemberSettings.Points, add);
		} catch (err) {
			this.client.emit(Events.Error, `Failed to add points to ${message.author.id}: ${(err && err.stack) || err}`);
		}
	}

	public shouldRun(message: KlasaMessage): boolean {
		return super.shouldRun(message) && message.guild !== null && message.member !== null;
	}

}
