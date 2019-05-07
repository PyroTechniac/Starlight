import { Message } from 'discord.js';

export interface PermissionLevel {
    break: boolean;
    check: (message: Message) => Promise<boolean> | boolean;
    fetch: boolean;
}