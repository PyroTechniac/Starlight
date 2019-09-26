import { BaseCluster } from 'kurasuta'

export default class extends BaseCluster {
    public launch(): void {
        this.client.login(process.env.TOKEN);
    }
}