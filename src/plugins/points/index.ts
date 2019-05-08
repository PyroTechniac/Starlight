import {Client as KlasaClient} from 'klasa';
import {PointsClient as Client} from './lib/Client';
import PointsUser = require('./lib/extensions/PointsUser')
import {Points} from './lib/util/Points';

export {Client, PointsUser, Points};

// @ts-ignore
exports[KlasaClient.plugin] = Client[KlasaClient.plugin];