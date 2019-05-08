import { StarlightClient } from './client/Client';

StarlightClient.use(require('./plugins/functions'));

new StarlightClient().login();