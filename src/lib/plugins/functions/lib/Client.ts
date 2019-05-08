import { Client, KlasaClientOptions, util } from 'klasa';
import { OPTIONS } from './util/Constants';
import { join } from 'path';
import { FunctionStore } from './structures/FunctionStore';


export class FunctionsClient extends Client {
    public constructor(options?: KlasaClientOptions) {
        super(options);
        // @ts-ignore
        this.constructor[Client.plugin].call(this);
    }

    public static [Client.plugin](this: FunctionsClient): void {
        util.mergeDefault(OPTIONS, this.options);

        const coreDirectory = join(__dirname, '..', '/');

        this.functions = new FunctionStore(this, coreDirectory);

        this.registerStore(this.functions);
        const { options } = this;
        const { returnMethod } = options.aliasFunctions;

        if (options.aliasFunctions.enabled && options.aliasFunctions.prefix) {
            if (options.aliasFunctions.prefix === 'functions') throw new Error('[Functions-Plugin] "functions" is not a valid prefix option');
            // @ts-ignore
            this[options.aliasFunctions.prefix] = new Proxy(this.functions, {
                get(target, prop): any {
                    if (prop === Symbol.iterator) return target[Symbol.iterator].bind(target);
                    return target.has(prop as string) ?
                        returnMethod
                            ? target.get(prop as string)[returnMethod]
                            : target.get(prop as string)
                        : prop in target
                            ? target[prop]
                            : 'Unknown Function';
                }
            });
        }
    }
}

declare module 'klasa' {
    interface KlasaClientOptions {
        aliasFunctions?: {
            enabled?: boolean;
            returnMethod?: string;
            prefix?: string;
        };
    }
}

declare module 'discord.js' {
    interface Client {
        functions: FunctionStore;
    }
}