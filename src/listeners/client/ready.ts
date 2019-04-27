import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
            category: 'client',
            type: 'once'
        });
    }

    public async exec(): Promise<void> {
        await this.client.fetchApplication();
        if (!this.client.ownerID) this.client.ownerID = this.client.application.owner.id;
        this.client.console.info(`[READY] Ready to serve ${this.client.users.size} users in ${this.client.guilds.size} guild${this.client.guilds.size === 1 ? '' : 's'}`);
        this.client.user.setActivity(`${this.client.user.username}, help`);
    }
}
