import { AkairoClient } from 'discord-akairo';
import { Collection, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export class Documentation {
    public client: AkairoClient;
    public classes: Collection<string, MessageEmbed> = new Collection();
    public typedefs: Collection<string, MessageEmbed> = new Collection();
    public constructor(client: AkairoClient) {
        this.client = client;
    }

    public async init() {

    }
}
