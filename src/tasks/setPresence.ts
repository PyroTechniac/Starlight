import { Task } from 'klasa';
import { PresenceData } from 'discord.js';

export default class PresenceTask extends Task {
    public async run(taskData: PresenceData): Promise<void> {
        await this.client.user!.setPresence(taskData);
    }
}