import { KlasaClient, KlasaUser } from 'klasa';
import { List } from '../lib/util/List';

export class StarlightClient extends KlasaClient {
    public get owners(): List<KlasaUser> {
        const owners = new List<KlasaUser>();
        for (const owner of this.options.owners) {
            const user = this.users.get(owner);
            if (user) owners.add(user);
        }
        return owners;
    }
}