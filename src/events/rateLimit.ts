import { Colors, Event } from 'klasa';

const HEADER: string = new Colors({ text: 'red' }).format('[RATELIMIT]');

interface RateLimitInto {
    timeout: number;
    limit: number;
    method: string;
    path: string;
    route: string;
}

export default class extends Event {
    public run({ timeout, limit, method, route }: RateLimitInto): void {
        this.client.emit('verbose', [
            HEADER,
            `Timeout: ${timeout}ms`,
            `Limit: ${limit} requests`,
            `Method: ${method.toUpperCase()}`,
            `Route: ${route}`
        ].join('\n'));
    }
}