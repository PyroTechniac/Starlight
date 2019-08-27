import { PieceOptions, Piece, Store } from 'klasa'
import { Constructor } from 'discord.js'

export function createClassDecorator(fn: Function): Function {
    return fn;
}

export function ApplyOptions<T extends PieceOptions>(options: T) {
    return createClassDecorator((target: Constructor<Piece>) => {
        return class extends target {
            public constructor(store: Store<string, Piece, typeof Piece>, file: string[], dir: string) {
                super(store, file, dir, options);
            }
        }
    })
}