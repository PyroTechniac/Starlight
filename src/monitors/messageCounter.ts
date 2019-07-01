import { Monitor, KlasaMessage, MonitorStore } from 'klasa';

export default class extends Monitor {
    public constructor(store: MonitorStore, file: string[], directory: string) {
        super(store, file, directory, {
            ignoreOthers: false
        });
    }

    public async run(message: KlasaMessage): Promise<void> {
        const previousCount = this.client.settings!.get('messageCount') as number;

        await this.client.settings!.update('messageCount', previousCount + 1);
    }
}