import { Settings } from 'klasa';
import { Structures, CategoryChannel } from 'discord.js';

class ChannelGatewaysCategoryChannel extends Structures.get('CategoryChannel') {
    public settings: Settings = this.client.gateways.get(`${this.type}Channels`)!.acquire(this);

    public toJSON(): object {
        return { ...super.toJSON(), settings: this.settings.toJSON() };
    }
}

Structures.extend('CategoryChannel', (): typeof CategoryChannel => ChannelGatewaysCategoryChannel);

export { ChannelGatewaysCategoryChannel };