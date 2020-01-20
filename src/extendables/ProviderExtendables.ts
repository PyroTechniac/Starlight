import { Extendable } from '../lib/util/Decorators';
import { Provider } from 'klasa';

export default class extends Extendable([Provider]) {

	public get shouldUnload(this: Provider): boolean {
		return this.client.providers.default!.name !== this.name;
	}

}
