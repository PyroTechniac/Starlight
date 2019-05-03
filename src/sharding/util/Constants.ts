export const http = {
    version: 7,
    api: 'https://discordapp.com/api'
};

export const version = '0.0.1';

export enum IPCEvents {
    EVAL,
    MESSAGE,
    BROADCAST,
    READY,
    SHARDREADY,
    SHARDRECONNECT,
    SHARDRESUMED,
    SHARDDISCONNECT,
    MASTEREVAL,
    RESTARTALL,
    RESTART,
    FETCHUSER,
    FETCHCHANNEL,
    FETCHGUILD
}