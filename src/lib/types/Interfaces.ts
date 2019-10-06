import { PieceOptions } from 'klasa';

export interface BTFProviderOptions {
	baseDirectory?: string;
}
export interface RawDiscordPacket {
	t?: string;
}

export interface RateLimitInfo {
	timeout: number;
	limit: number;
	method: string;
	path: string;
	route: string;
}

export interface APIUserData {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	bot?: boolean;
	mfa_enabled?: boolean;
	locale?: string;
	verified?: boolean;
	email?: string;
}

export interface APIWebhookData {
	id: string;
	guild_id?: string;
	channel_id: string;
	user?: APIUserData;
	name: string | null;
	avatar: string | null;
	token: string;
}

export interface IPCMonitorOptions extends PieceOptions {}

export interface WebSocketStatistics {
	heapTotal: number;
	heapUsed: number;
	ping: [number, number, number];
	status: number;
}

export interface TomlOptions {
	encoding?: string;
	mode?: number;
	flag?: string;
}

export interface ReadTOMLOptions {
	encoding?: BufferEncoding;
	flag?: string | number;
}