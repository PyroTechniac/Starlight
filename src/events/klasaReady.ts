import { Event, EventOptions, Type } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { initClean } from '@klasa/utils';
import { Team } from 'discord.js';
import { filterArray } from '../lib/util/Utils';


@ApplyOptions<EventOptions>({
	once: true
})
export default class extends Event {

	public run(): void {
		initClean(this.client.token!);
		this.client.options.owners = this.resolveOwners();
		this.client.cache.clean(true);
	}

	private resolveOwners(): string[] {
		let owners: string[] = [];
		const { owner } = this.client.application;

		if (owner === null) throw new TypeError(`Expected either a Team or User, got: ${new Type(owner)}`);
		if (owner instanceof Team) {
			owners.push(...owner.members.keys());
		} else {
			owners.push(owner.id);
		}

		if (this.client.options.owners.length) owners = owners.concat(this.client.options.owners);

		return filterArray(owners);
	}

}
