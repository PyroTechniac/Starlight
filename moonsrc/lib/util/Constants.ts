import { PermissionLevels, KlasaMessage } from 'klasa';
import { PresenceData } from 'discord.js';

export namespace Constants {
    export const permissionLevels = new PermissionLevels()
        .add(0, (): boolean => false)
        .add(10, ({ client, author }: KlasaMessage): boolean => client.owners.has(author!));

    export enum OPCODES {
        HELLO
    }

    export const DefaultPresenceData: PresenceData = {
        afk: false,
        status: 'online',
        activity: {
            type: 'WATCHING',
            name: 'the stars'
        }
    };
}