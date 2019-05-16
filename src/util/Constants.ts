import { ConfigOptions } from './Config';
import { PresenceData } from 'discord.js';

export const ConfigDefaults: ConfigOptions = {
    token: '',
    prefix: '!',
    ownerID: ''
};

export const DefaultPresence: Partial<PresenceData> = {
    afk: false,
    activity: {
        name: 'Starlight, help',
        type: 'PLAYING'
    },
    status: 'online'
};