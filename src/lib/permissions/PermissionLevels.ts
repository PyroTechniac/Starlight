import { Collection, Message } from 'discord.js';
import { PermissionLevel, PermissionLevelOptions } from '../interfaces';

const empty = Symbol('empty');

export class PermissionLevels extends Collection<number, PermissionLevel> {
    public constructor(levels: number = 11) {
        super();

        for (let i = 0; i < levels; i++) super.set(i, empty as any);
    }

    public add(level: number, check: (message: Message) => boolean, options: PermissionLevelOptions = {}): this {
        return this.set(level, { check, break: Boolean(options.break), fetch: Boolean(options.fetch) } as PermissionLevel);
    }

    public remove(level: number): this {
        return this.set(level, empty as any);
    }

    public set(level: number, obj: PermissionLevelOptions | symbol): this {
        if (level < 0) throw new RangeError(`Cannot set permission level ${level}. Permission levels start at 0`);
        if (level > (this.size - 1)) throw new RangeError(`Cannot set permission level ${level}. Permission levels stop at ${this.size - 1}`);
        return super.set(level, obj as PermissionLevel);
    }

    public isValid(): boolean {
        return this.every(level => level === empty as any || (typeof level === 'object' && typeof level.break === 'boolean' && typeof level.check === 'function'));
    }
}