import { StarlightClient } from './client/Client';

StarlightClient.use('./plugins/functions');

new StarlightClient().login();