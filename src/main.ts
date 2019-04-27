import { BaseCluster } from 'kurasuta';

export default class StarlightCluster extends BaseCluster {
    public async launch() {
        this.client.login();
    }
}
