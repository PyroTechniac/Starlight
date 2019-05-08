import { Client as KlasaClient } from 'klasa';

import { FunctionsClient as Client } from './lib/Client';

export { Client };
export { Function } from './lib/structures/Function';
export { FunctionStore } from './lib/structures/FunctionStore';
// @ts-ignore
exports[KlasaClient.plugin] = Client[KlasaClient.plugin];