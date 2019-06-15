import { PresenceData } from 'discord.js';
export namespace Constants {
    export const DefaultPresenceData: PresenceData = {
        afk: false,
        status: 'online',
        activity: {
            type: 'PLAYING',
            name: 'Starlight, help'
        }
    };

    export enum OPCODES {
        HELLO
    }
}