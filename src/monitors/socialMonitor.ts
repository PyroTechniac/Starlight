import { Monitor, RateLimitManager, KlasaMessage } from 'klasa';
import { UserSettings } from '../lib/settings/UserSettings';
import { Events } from '../lib/types/Enums';

export default class extends Monitor {
    private readonly ratelimits = new RateLimitManager(1, 60000);

    public async run(message: KlasaMessage): Promise<void> {
        try {
            this.ratelimits.acquire(message.author.id).drip();
        } catch {
            return;
        }

        await message.author.settings.sync();

        const points = Math.round((Math.random() * 4) + 4) + message.author.settings.get(UserSettings.Points);

        await message.author.settings.update(UserSettings.Points, points).catch((err): void => {
            this.client.emit(Events.Error, `Failed to add points to ${message.author.id}: ${(err && err.stack) || err}`);
        });
    }
}