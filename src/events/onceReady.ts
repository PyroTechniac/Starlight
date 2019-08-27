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

        this.client.options.owners = Array.from(this.resolveOwners());

        this.client.mentionPrefix = new RegExp(`^<@!?${this.client.user!.id}>`);
    }

    private resolveOwners(): Set<string> {
        const owners: Set<string> = new Set();

        const {owner} = this.client.application;

        if (owner === null) throw new Error('Application owner is null, something went wrong.');
        if (owner instanceof Team) {
            for (const id of owner.members.keys()) owners.add(id);
        } else {
            owners.add(owner.id);
        }
        if (this.client.options.owners.length) {
            for (const id of this.client.options.owners) owners.add(id);
        }

        return owners;
    }
}