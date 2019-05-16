import { Collection } from 'discord.js';

export class Stats extends Collection<string, number> {
    public inc(key: string): void {
        let count = this.get(key);
        if (typeof count === 'undefined') throw `Couldn't find ${key}`;
        count++;
        this.set(key, count);
    }

    public dec(key: string): void {
        let count = this.get(key);
        if (typeof count === 'undefined') throw `Couldn't find ${key}`;
        count--;
        this.set(key, count);
    }

    public add(key: string): this {
        return this.set(key, 0);
    }
}