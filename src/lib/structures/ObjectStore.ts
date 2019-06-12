import { KlasaClient, Piece, Store } from 'klasa';

export class ObjectStore extends Store<string, Piece> {
    public constructor(client: KlasaClient) {
        super(client, 'objects', <any>Piece); // eslint-disable-line
    }
}