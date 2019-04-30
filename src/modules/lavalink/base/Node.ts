import WebSocket = require('ws');
import { EventEmitter } from 'events';

export interface VoiceStateUpdate {
    guild_id: string;
    channel_id?: string;
    user_id: string;
    session_id: string;
    deaf?: boolean;
    mute?: boolean;
    self_deaf?: boolean;
    self_mute?: boolean;
    suppress?: boolean;
}

export interface VoiceServerUpdate {
    guild_id: string;
    token: string;
    endpoint: string;
}

export interface BaseNodeOptions {
    password: string;
    userID: string;
    shardCount?: number;
    hosts?: {
        rest?: string;
        ws?: string | { url: string; options: WebSocket.ClientOptions };
    };
}

export abstract class BaseNode extends EventEmitter {
    public abstract send(guildID: string, packet: any): Promise<any>;

    public password: string;
    public userID: string;
    public shardCount?: number;
}
