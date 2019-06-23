import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export interface PostRequest {
    post(request: KlasaIncomingMessage, response: ServerResponse): any;
}