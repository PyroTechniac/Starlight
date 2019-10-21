import { Provider as BaseProvider, SQLProvider as BaseSQLProvider } from 'klasa';

export abstract class Provider extends BaseProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

}

export abstract class SQLProvider extends BaseSQLProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

}
