import { BaseCluster } from 'kurasuta';

export default class extends BaseCluster {
    public async launch(): Promise<void> {
        await this.client.login(process.env.TOKEN);
    }
}