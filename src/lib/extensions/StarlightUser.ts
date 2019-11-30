import { Structures, User } from 'discord.js';
import { UserFlags } from '../util/UserFlags';

export class StarlightUser extends Structures.get('User') {

	public constructor(client, data) {
		super(client, data);

		this.flags = new UserFlags(data.flags ?? 0);
	}

}

Structures.extend('User', (): typeof User => StarlightUser);
