import { Argument, MultiArgument } from 'klasa';

export default class extends MultiArgument {

	public get base(): Argument {
		return this.store.get('username');
	}

}
