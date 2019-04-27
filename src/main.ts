import { BaseCluster } from 'kurasuta';
import StarlightClient from './client/StarlightClient';
import { Client } from 'discord.js';

export default class StarlightCluster extends BaseCluster {
    public async launch() {
        this.client.login();
    }
}
