import { PresenceData, Permissions } from 'discord.js';
import { Type } from 'klasa';

export namespace Util {
    export const noop = (): null => null;

    export const sanitizeKeyName = (value: string): string => {
        if (typeof value !== 'string') throw new TypeError(`[SANITIZE_NAME] Expected a string, got: ${new Type(value)}`);
        if (/`|"/.test(value)) throw new TypeError(`Invalid input (${value}).`);
        if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') return value;
        return `"${value}"`;
    };

    export const transformValue = (value: any): any => {
        switch (typeof value) {
            case 'boolean':
            case 'number': return value;
            case 'object': return value === null ? value : JSON.stringify(value);
            default: return String(value);
        }
    };

    export const valueList = (length: number): string => Array.from({ length }, (): string => '?').join(', ');

    export const formatTime = (syncTime: string, asyncTime: string): string => {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    };
}

export namespace Constants {
    export const DefaultPresenceData: PresenceData = {
        afk: false,
        status: 'online',
        activity: {
            type: 'PLAYING',
            name: 'Starlight, help'
        }
    };

    export const RichDisplayPermissions: Permissions = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);
}