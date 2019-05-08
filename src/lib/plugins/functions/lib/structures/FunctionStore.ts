import { Store } from 'klasa';
import { FunctionsClient } from '../Client';
import { Function } from './Function';

export class FunctionStore extends Store<string, Function> {
    public constructor(client: FunctionsClient, coreDirectory: string) {
        super(client, 'functions', Function);
        this.registerCoreDirectory(coreDirectory);
    }
}