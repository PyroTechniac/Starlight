import { StorageProvider } from './StorageProvider';
import { StorageUtil as Util } from './StorageUtil';

export class SharedProviderStorage {
    protected _cache: { [key: string]: any } = {}

    public constructor(protected readonly _provider: StorageProvider, protected readonly _key: string) { }

    public async init() {
        try {
            let data: any = await this._provider.get(this._key);
            if (typeof data === 'undefined') {
                data = {};
                await this._provider.set(this._key, JSON.stringify(data));
            } else { data = JSON.parse(data); }

            this._cache = data;
        } catch (err) {
            console.warn(`SharedProviderStorage: ${err.stack}`);
        }
    }

    public async keys(): Promise<string[]> {
        return Object.keys(this._cache);
    }

    public async get(key: string): Promise<any> {
        if (typeof key === 'undefined') throw new TypeError('Key must be provided');
        if (typeof key !== 'string') throw new TypeError('Key must be a string');

        if (key.includes('.')) {
            const path: string[] = key.split('.');
            return Util.getNestedValue(this._cache[path.shift()], path);
        }
        return this._cache[key];
    }

    public async exists(key: string): Promise<boolean> {
        return typeof await this.get(key) !== 'undefined';
    }

    public async set(key: string, value: any): Promise<void> {
        if (typeof key === 'undefined') throw new TypeError('Key must be provided');
        if (typeof key !== 'string') throw new TypeError('Key must be a string');
        if (typeof value === 'undefined') throw new TypeError('Value must be provided');

        try { JSON.stringify(value); } catch { value = {}; } // eslint-disable-line

        if (key.includes('.')) {
            const path: string[] = key.split('.');
            key = path.shift();

            if (typeof this._cache[key] === 'undefined') {
                this._cache[key] = {};
            }

            Util.assignNestedValue(this._cache[key], path, value);
        } else { this._cache[key] = value; }

        await this._provider.set(this._key, JSON.stringify(this._cache));
    }

    public async remove(key: string): Promise<void> {
        if (typeof key === 'undefined') throw new TypeError('Key must be provided');
        if (typeof key !== 'string') throw new TypeError('Key must be a string');

        if (key.includes('.')) {
            const path: string[] = key.split('.');
            key = path.shift();

            if (typeof this._cache[key] !== 'undefined') Util.removeNestedValue(this._cache[key], path);
        } else { delete this._cache[key]; }

        await this._provider.set(this._key, JSON.stringify(this._cache));
    }

    public async clear() {
        this._cache = {};
        await this._provider.set(this._key, JSON.stringify(this._cache));
    }
}
