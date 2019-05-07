import { Util } from '../../util';
import { join } from 'path';
import { StarlightClient } from '../../Client';
import { Store } from './Store';
const { mergeDefault } = Util;

export abstract class Piece {
    public constructor(client: StarlightClient, store: Store<string, Piece, typeof Piece>, file: string[], directory: string) {}
}