import { StarlightClient } from './client/Client';
import { config } from './util';
config();

StarlightClient.use(require('./plugins/functions'));

new StarlightClient().login();