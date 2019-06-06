import { BaseCluster } from 'kurasuta';

export default class extends BaseCluster {
    // @ts-ignore
    public launch(): void {
        // @ts-ignore
        this.client.login(this.manager.token);
    }
}