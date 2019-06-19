import { PresenceData } from 'discord.js';
import { Structures } from '../lib';

export default class extends Structures.get('Task') {
    public async run(data: PresenceData): Promise<void> {
        await this.client.user!.setPresence(data);
    }
}