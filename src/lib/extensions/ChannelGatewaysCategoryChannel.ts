import { CategoryChannel, Structures } from 'discord.js';
import { Settings } from 'klasa';

class ChannelGatewaysCategoryChannel extends Structures.get('CategoryChannel') {
    public settings: Settings = this.client.gateways.get(`${this.type}Channels`)!.acquire(this);

    public toJSON(): object {
        return { ...super.toJSON(), settings: this.settings.toJSON() };
    }
}

Structures.extend('CategoryChannel', (): typeof CategoryChannel => ChannelGatewaysCategoryChannel);

export { ChannelGatewaysCategoryChannel };