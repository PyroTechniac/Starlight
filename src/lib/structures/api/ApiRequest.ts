import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { UserAuthObject } from '../../types/Interfaces';

export class ApiRequest extends IncomingMessage {

	public constructor(socket: Socket) {
		super(socket);
	}

}

export interface ApiRequest {
	originalUrl: string;
	path: string;
	search: string;
	query: Record<string, string | string[]>;
	params: Record<string, string>;
	body?: unknown;
	length?: number;
	auth?: UserAuthObject;
}
