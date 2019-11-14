import { Task } from 'klasa';

export default class extends Task {

	public run(): void {
		return this.client.cache.clean();
	}

}
