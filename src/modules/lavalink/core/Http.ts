import { request, IncomingMessage, IncomingHttpHeaders, STATUS_CODES } from 'http';
import { URL } from 'url';
import { BaseNode as Node } from '../base/Node';

export class HTTPError extends Error {
    public readonly statusMessage!: string;
    public method: string;
    public statusCode: number;
    public headers: IncomingHttpHeaders;
    public path: string;
    public constructor(httpMessage: IncomingMessage, method: string, url: URL) {
        super(`${httpMessage.statusCode} ${STATUS_CODES[httpMessage.statusCode as number]}`);
        Object.defineProperty(this, 'statusMessage', { enumerable: true, get: function() { return STATUS_CODES[httpMessage.statusCode as number]; } }); // eslint-disable-line max-statements-per-line
        this.statusCode = httpMessage.statusCode as number;
        this.headers = httpMessage.headers;
        this.name = this.constructor.name;
        this.path = url.toString();
        this.method = method;
    }
}

export enum LoadType {
    TRACK_LOADED = 'TRACK_LOADED',
    PLAYLIST_LOADED = 'PLAYLIST_LOADED',
    SEARCH_RESULT = 'SEARCH_RESULT',
    NO_MATCHES = 'NO_MATCHES',
    LOAD_FAILED = 'LOAD_FAILED'
}

export interface TrackResponse {
    loadType: LoadType;
    playlistInfo: PlaylistInfo;
    tracks: Track[];
}

export interface PlaylistInfo {
    name?: string;
    selectedTrack?: number;
}

export interface Track {
    track: string;
    info: {
        identifier: string;
        isSeekable: boolean;
        author: string;
        length: number;
        isStream: boolean;
        position: number;
        title: string;
        uri: string;
    };
}

export class Http {
    public readonly node: Node;
    public input: string;
    public base?: string;

    public constructor(node: Node, input: string, base?: string) {
        this.node = node;
        this.input = input;
        this.base = base;
    }
}
