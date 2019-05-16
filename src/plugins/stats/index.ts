import { StatsClient as Client } from './lib/Client';

import { KlasaClient } from 'klasa';

export { Client };

export { Stats } from './lib/structures/Stats';
export { StatsStore } from './lib/structures/StatsStore';

// @ts-ignore
exports[KlasaClient.plugin] = Client[KlasaClient.plugin];