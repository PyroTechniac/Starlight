import { Task } from 'klasa';
import { PresenceData } from 'discord.js';

export default class extends Task {
    public async run(data: PresenceData): Promise<void> {
        await this.client.user!.setPresence(data);
    }
}