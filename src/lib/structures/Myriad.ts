import {Client} from "discord.js";
import fetch from 'node-fetch';

const entries: [string, string[]][] = [
    ['apl', ['apl']],
    ['bash', ['bash', 'sh']],
    ['brainfuck', ['brainfuck', 'bf']],
    ['c', ['c']],
    ['clojure', ['clojure', 'clj']]
];

export class Myriad {
    public static Languages = new Map(entries);
    public static Aliases = new Map();
    private static initialized: boolean = false;
    public readonly client!: Client;
    public enabled: boolean;
    public port: number;

    public constructor(client: Client) {
        if (!Myriad.initialized) Myriad.init();
        Object.defineProperty(this, 'client', {value: client});

        this.enabled = this.client.options.myriad.enabled!;

        this.port = this.client.options.myriad.port!;
    }

    public static init() {
        for (const [l, xs] of entries) {
            for (const x of xs) {
                Myriad.Aliases.set(x, l);
            }
        }
        this.initialized = true;
    }

    public async eval(language: string, code: string): Promise<[boolean, string]> {
        const response = await fetch(this.url('eval'), {
            method: 'POST',
            body: JSON.stringify({language, code}),
            headers: {'Content-Type': 'application/json'}
        });

        if (!response.ok) {
            const status = response.status;
            const text = await response.text();
            if (status === 404 && text === `Language ${language} was not found`) {
                return [false, `Invalid language ${language}`];
            }

            if (status === 500 && text === 'Evaluation failed') {
                return [false, 'Evaluation failed'];
            }

            if (status === 504 && text === 'Evaluation timed out') {
                return [false, 'Evaluation timed out'];
            }

            throw new Error(`Unexpected ${response.status} response from Myriad, ${response.statusText}`);
        }

        const body = await response.json();
        return [true, body.result || '\n'];
    }

    public async languages(): Promise<string[]> {
        return (await this.client.cdn.acquire(this.url('languages'))
            .setOptions({
                method: 'GET'
            })
            .fetch())
            .data<string[]>()!;
    }

    public async cleanup(): Promise<string[]> {
        return (await this.client.cdn.acquire(this.url('cleanup'))
            .setOptions({
                method: 'POST'
            })
            .fetch(true))
            .data<string[]>()!;
    }

    private url(k: string) {
        return `http://localhost:${this.port}/${k}`;
    }
}