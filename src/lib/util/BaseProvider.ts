import { Provider as BaseProvider, SQLProvider as BaseSQLProvider } from 'klasa';

function init(provider: BaseProvider | BaseSQLProvider): Promise<void> {
	if (provider.client.options.providers.default !== provider.name) provider.unload();
	return Promise.resolve();
}

export abstract class Provider extends BaseProvider {

	public init(): Promise<void> {
		return init(this);
	}

}

export abstract class SQLProvider extends BaseSQLProvider {

	public init(): Promise<void> {
		return init(this);
	}

}
