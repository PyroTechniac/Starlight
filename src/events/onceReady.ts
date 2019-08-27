import { Event, EventOptions, util } from 'klasa'
import { Team } from 'discord.js'
import { ApplyOptions } from '../lib';
let retries = 0;

@ApplyOptions<EventOptions>({
    event: 'ready',
    once: true
})
export default class extends Event {
    public async run(): Promise<void> {
        try {
            await Promise.all([
                this.client.fetchVoiceRegions(),
                this.client.fetchApplication()
            ]);
        } catch (err) {
            if (++retries === 3) return process.exit();
            this.client.emit('warning', `Unable to fetchVoiceRegions/fetchApplication at this time, waiting 5 seconds and retrying. Retries left: ${retries - 3}`);
            await util.sleep(5000);
            return this.run();
        }
    }

    private resolveOwners(): string[] {
        
    }
}