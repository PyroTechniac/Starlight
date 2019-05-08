import {Client, KlasaMessage, Monitor, MonitorStore} from 'klasa';

export default class PointsInitialAmount extends Monitor {
    private readonly options = this.client.options.points;
    public constructor(client: Client, store: MonitorStore, file: string[], directory: string) {
        super(client, store, file, directory, {ignoreOthers: false});
    }

    public async run(message: KlasaMessage): Promise<null> {
        if ((!this.options.initialAmount) || (!this.options.enabled)) return null;
        if (!message.guild) return null;
        await message.guild.members.fetch(message.author!);
        await message.author!.settings.sync();
        const receivedInitial = message.author!.settings.get('points.receivedInitial') as boolean;
        if (receivedInitial) return null;
        const points = message.author!.settings.get('pointsPlugin.count') as number;
        await message.author!.settings.update([
            ['points.count', points + this.options.initialAmount],
            ['points.receivedInitial', true]
        ]);
        return null;
    }
}