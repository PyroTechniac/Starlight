import { Client, KlasaMessage, Monitor, MonitorStore } from 'klasa';

export default class PointsAddition extends Monitor {
    private readonly options = this.client.options.points;
    public constructor(client: Client, store: MonitorStore, file: string[], directory: string) {
        super(client, store, file, directory, { ignoreOthers: false });
    }

    public async run(message: KlasaMessage): Promise<true | null> {
        if (!this.options.enabled) return null;
        const user = message.author!;
        if (user.points.limiter.limited) return null;
        try {
            user.points.limiter.drip();
            const points = user.settings.get('pointsPlugin.count') as number;
            await user.settings.update([['points.count', points + user.points.genPoints()]]);
            return true;
        } catch {
            return null;
        }
    }
}