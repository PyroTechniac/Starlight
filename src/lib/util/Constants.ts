import { PresenceData } from 'discord.js';

export const DefaultPresenceData: PresenceData = {
    afk: false,
    status: 'online',
    activity: {
        type: 'PLAYING',
        name: 'Starlight, help'
    }
};