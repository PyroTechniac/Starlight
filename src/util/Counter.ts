import { Config } from './Config';
import { AkairoClient } from 'discord-akairo';

export class Counter {
    private _count: number = 0;
    public constructor(public client: AkairoClient, public config: Config) { }

    public get count(): number {
        return this._count;
    }

    public inc() {
        this._count++;
    }

    public dec() {
        this._count--;
    }
}
