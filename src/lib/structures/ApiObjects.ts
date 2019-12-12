import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { UserAuthObject } from '../types/Interfaces';
import { ServerResponse, STATUS_CODES } from 'http';
import { MimeTypes } from '../types/Enums';


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

export class ApiResponse extends ServerResponse {

    public error(error: number | string): void {
        return typeof error === 'string'
            ? this.status(500).json({ error })
            : this.status(error).json({ error: STATUS_CODES[error] });
    }

    public ok(data: unknown = STATUS_CODES[200]): void {
        this.status(200);
        return typeof data === 'string' ? this.text(data) : this.json(data);
    }

    public badRequest(data: unknown = STATUS_CODES[400]): void {
        this.status(400);
        return typeof data === 'string' ? this.text(data) : this.json(data);
    }

    public forbidden(data: unknown = STATUS_CODES[403]): void {
        this.status(403);
        return typeof data === 'string' ? this.text(data) : this.json(data);
    }

    public status(code: number): this {
        this.statusCode = code;
        return this;
    }

    public json(data: any): void {
        this.setContentType(MimeTypes.ApplicationJson)
            .end(JSON.stringify(data));
    }

    public text(data: string): void {
        this.setContentType(MimeTypes.TextPlain)
            .end(data);
    }

    public setContentType(contentType: MimeTypes): this {
        this.setHeader('Content-Type', contentType);
        return this;
    }

}
