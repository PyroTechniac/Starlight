// Copyright (c) 2019 kyranet. All rights reserved. Apache License.
// This is a remake of the Alestra bot (found here: https://github.com/kyranet/Alestra) in plugin format

import { CanvasClient as Client } from './lib/Client';
import { KlasaClient } from 'klasa';

export { Client, Client as CanvasClient };

// @ts-ignore
exports[KlasaClient.plugin] = Client[KlasaClient.plugin];
