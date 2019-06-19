import { AliasPiece, Argument, Command, Event, Extendable as KlasaExtendable, Finalizer, Inhibitor, Language, Monitor, Piece, Provider, SQLProvider, Task } from 'klasa';

interface Extendable {
    AliasPiece: typeof AliasPiece;
    Argument: typeof Argument;
    Command: typeof Command;
    Event: typeof Event;
    Extendable: typeof KlasaExtendable;
    Finalizer: typeof Finalizer;
    Inhibitor: typeof Inhibitor;
    Language: typeof Language;
    Monitor: typeof Monitor;
    Piece: typeof Piece;
    Provider: typeof Provider;
    SQLProvider: typeof SQLProvider;
    Task: typeof Task;
}

const structures: Extendable = {
    AliasPiece,
    Argument,
    Command,
    Event,
    Extendable: KlasaExtendable,
    Finalizer,
    Inhibitor,
    Language,
    Monitor,
    Piece,
    Provider,
    SQLProvider,
    Task
};

export class Structures {
    public constructor() {
        throw new Error(`The ${(this.constructor as typeof Structures).name} class may not be instantiated.`);
    }

    public static get<K extends keyof Extendable>(structure: K): Extendable[K] {
        if (typeof structure === 'string') return structures[structure];
        throw new TypeError(`"structure" argument must be a string (received ${typeof structure})`);
    }

    public static extend<K extends keyof Extendable, T extends Extendable[K]>(structure: K, extender: (baseClass: Extendable[K]) => T): T {
        if (!structures[structure]) throw new RangeError(`"${structure}" is not a valid extensible structure.`);
        if (typeof extender !== 'function') {
            const received = `(received ${typeof extender})`;
            throw new TypeError(`"extender" argument must be a function that returns the extended structure class/prototype ${received}.`);
        }
        const extended = extender(structures[structure]);
        if (typeof extended !== 'function') {
            const received = `(received ${typeof extended})`;
            throw new TypeError(`The extender function must return the extended structure class/prototype ${received}.`);
        }

        if (!(extended.prototype instanceof structures[structure])) {
            const prototype = Object.getPrototypeOf(extended);
            const received = `${extended.name || 'unnamed'}${prototype.name ? ` extends ${prototype.name}` : ''}`;
            throw new Error(
                'The class/prototype returned from the extender function must extend the existing structure class/prototype' +
                ` (received function ${received}; expected extension of ${structures[structure].name}).`
            );
        }

        structures[structure] = extended;
        return extended;
    }
}