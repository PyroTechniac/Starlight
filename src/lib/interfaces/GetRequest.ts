import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export interface GetRequest {
    get(request: KlasaIncomingMessage, response: ServerResponse): void;
}