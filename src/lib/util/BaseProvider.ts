import { Provider as BaseProvider, SQLProvider as BaseSQLProvider } from 'klasa';
import { Queue } from 'paket-queue';

export class GetQueue extends Queue<string, unknown> {

	protected createTimer(): void {
		setTimeout((): Promise<void> => this.handleNextTick(), 5);
	}

}

export abstract class Provider extends BaseProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

	protected abstract ensureQueue(table: string): GetQueue;

}

export abstract class SQLProvider extends BaseSQLProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

}
