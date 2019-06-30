import { Event, Colors } from 'klasa';

interface RateLimitInfo {
    timeout: number;
    limit: number;
    method: string;
    path: string;
    route: string;
}

const HEADER = new Colors({ text: 'red' }).format('[RATELIMIT]');

export default class extends Event {
    public run({ timeout, limit, method, path, route }: RateLimitInfo): void {
        this.client.emit('verbose', [
            HEADER,
            `Timeout: ${timeout}ms`,
            `Limit: ${limit} requests`,
            `Method: ${method.toUpperCase()}`,
            `Path: ${path}`,
            `Route: ${route}`
        ].join('\n'));
    }
}