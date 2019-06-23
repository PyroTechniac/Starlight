import { PresenceData } from 'discord.js';
import { Task } from 'klasa';

export default class extends Task {
    public async run(data: PresenceData): Promise<void> {
        await this.client.user!.setPresence(data);
    }
}