import {Piece, Serializer, SerializerUpdateContext} from 'klasa';
import {toss} from "../lib/util/Utils";

export default  class extends Serializer {
    public aliases = [...this.client.pieceStores.keys()].map((type): string => type.slice(0, -1));

    public validate(data: string, {entry, language}: SerializerUpdateContext): Piece {
        if (entry.type === 'piece') {
            for (const store of this.client.pieceStores.values()) {
                const pce = store.get(data);
                if (pce) return pce;
            }
            throw language.get('RESOLVER_INVALID_PIECE', entry.key, entry.type);
        }

        const store = this.client.pieceStores.get(`${entry.type}s`);
        if (!store) throw language.get('RESOLVER_INVALID_STORE', entry.type);
        const parsed = typeof data === 'string' ? store.get(data) : data;
        return (parsed && parsed instanceof store.holds) ? parsed : toss(language.get('RESOLVER_INVALID_PIECE', entry.key, entry.type));
    }

    public serialize(data :Piece): string {
        return data.name;
    }
}
