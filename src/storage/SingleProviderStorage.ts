import { StorageProvider, StorageProviderConstructor } from './StorageProvider';
import { StorageUtil as Util } from './StorageUtil';

export class SingleProviderStorage {
    private readonly _storage: StorageProvider

    public constructor(name: string, provider: StorageProviderConstructor) {
        this._storage = new provider(name);
    }

    public async init(): Promise<void> {
        await this._storage.init();
    }

    public async keys(): Promise<string[]> {
        return await this._storage.keys(); // eslint-disable-line
    }

    public async get(key: string): Promise<any> {
        if (typeof key === 'undefined') throw new TypeError('Key must be provided');
        if (typeof key !== 'string') throw new TypeError('Key must be a string');

        if (key.includes('.')) {
            const path: string[] = key.split('.');
            const stringData: string = (await this._storage.get(path.shift()));
            if (typeof stringData === 'undefined') return;
            const data: object = JSON.parse(stringData);
            return Util.getNestedValue(data, path);
        }
        const stringData: string = (await this._storage.get(key))!;
        if (typeof stringData === 'undefined') return;
        return JSON.parse(stringData);
    }

    public async exists(key: string): Promise<boolean> {
        return typeof await this.get(key) !== 'undefined';
    }

    public async set(key: string, value: any): Promise<void> {
        if (typeof key === 'undefined') throw new TypeError('Key must be provided');
        if (typeof key !== 'string') throw new TypeError('Key must be a string');
        if (typeof value === 'undefined') throw new TypeError('Value must be provided');

        try { JSON.stringify(value); } catch { value = {}; } // eslint-disable-line

        let data: any;
        if (key.includes('.')) {
            const path: string[] = key.split('.');
            key = path.shift()!;

            data = await this.get(key);
            if (typeof data === 'undefined') data = {};

            Util.assignNestedValue(data, path, value);
        } else { data = value; }

        await this._storage.set(key, JSON.stringify(data));
    }

    public async remove(key: string): Promise<void> {
        if (typeof key === 'undefined') throw new Error('Key must be provided');
        if (typeof key !== 'string') throw new Error('Key must be a string');

        let data: any;
        if (key.includes('.')) {
            const path: string[] = key.split('.');
            key = path.shift();

            data = await this.get(key);
            if (typeof data !== 'undefined') {
                Util.removeNestedValue(data, path);
            }

            await this._storage.set(key, JSON.stringify(data));
        } else { await this._storage.remove(key); }
    }

    public async clear() {
        await this._storage.clear();
    }
}
