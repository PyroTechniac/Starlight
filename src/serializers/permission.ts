import { Language, Serializer } from 'klasa';
import { BitFieldResolvable, Permissions, PermissionString } from 'discord.js';

export default class extends Serializer {

	public deserialize(data: BitFieldResolvable<PermissionString>, entry, language: Language): Promise<Permissions> {
		if (data instanceof Permissions) return Promise.resolve(data);
		try {
			return Promise.resolve(new Permissions(data));
		} catch {
			throw language.get('RESOLVER_INVALID_PERMISSIONS', entry.key);
		}
	}

	public serialize(data: Permissions): number {
		return Permissions.resolve(data);
	}

	public stringify(data: Permissions): string {
		return data.toArray().join();
	}

}
