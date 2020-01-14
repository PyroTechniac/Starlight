import { ReferredPromise } from '../types/Interfaces';
import { cast, createReferPromise } from '../util/Utils';

export class RequestHandler<K, V extends IdKeyed<K>> {

	public getFn: GetFn<K, V>;
	public getAllFn: GetAllFn<K, V>;
	private queue = new Map<K, ReferredPromise<V | null>>();
	private synchronizing: Promise<void> | null = null;

	public constructor(getFn: GetFn<K, V>, getAllFn: GetAllFn<K, V>) {
		this.getFn = getFn;
		this.getAllFn = getAllFn;
	}

	public get available(): boolean {
		return this.synchronizing === null;
	}

	public push(key: K): Promise<V> {
		const previous = this.queue.get(key);
		if (typeof previous !== 'undefined') return cast<Promise<V>>(previous.promise);

		const referredPromise = createReferPromise<V>();
		this.queue.set(key, referredPromise);
		if (this.available) this.synchronizing = this.run();
		return cast<Promise<V>>(referredPromise.promise);
	}

	public async wait(): Promise<void> {
		if (this.synchronizing === null) return;

		try {
			await this.synchronizing;
		} catch {
			// noop
		}

		if (this.synchronizing !== null) {
			try {
				await this.synchronizing;
			} catch {
				// noop
			}
		}
	}

	private async run(): Promise<void> {
		const { queue } = this;
		this.queue = new Map();

		const keys = [...queue.keys()];
		if (keys.length === 1) {
			const [key] = keys;
			try {
				const value = await this.getFn(key);
				queue.get(key)!.resolve(value);
			} catch (error) {
				queue.get(key)!.reject(error);
			}
		} else if (keys.length > 1) {
			try {
				const values = await this.getAllFn(keys);
				for (const value of values) {
					if (value === null || typeof value !== 'object') continue;

					const entry = queue.get(value.id);
					if (typeof entry === 'undefined') continue;
					entry.resolve(value);
					queue.delete(value.id);
				}
				for (const entry of queue.values()) {
					entry.resolve(null);
				}
			} catch (error) {
				for (const entry of queue.values()) {
					entry.reject(error);
				}
			}
		}
		this.synchronizing = this.queue.size === 0 ? null : this.run();
	}

}

export interface IdKeyed<K> {
	id: K;
}

export interface GetFn<K, V> {
	(key: K): Promise<V>;
}

export interface GetAllFn<K, V> {
	(keys: K[]): Promise<V[]>;
}
