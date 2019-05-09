import { Event, Colors } from 'klasa';

const HEADER = new Colors({ text: 'red' }).format('[RATELIMIT]');

interface RateLimitInfo {
    timeout: number;
    limit: number;
    method: string;
    path: string;
    route: string;
}

export default class RateLimitEvent extends Event {
    public run({ timeout, limit, method, route }: RateLimitInfo): void {
        this.client.emit('verbose', [
            HEADER,
            `Timeout: ${timeout}ms`,
            `Limit: ${limit} requests`,
            `Method: ${method.toUpperCase()}`,
            `Route: ${route}`
        ].join('\n'));
    }
}