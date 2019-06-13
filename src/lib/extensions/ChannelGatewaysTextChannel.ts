import { Structures, TextChannel } from 'discord.js';
import { Settings } from 'klasa';

class ChannelGatewaysTextChannel extends Structures.get('TextChannel') {
    public settings: Settings = this.client.gateways.get(`${this.type}Channels`)!.acquire(this);

    public toJSON(): object {
        return { ...super.toJSON(), settings: this.settings.toJSON() };
    }
}

Structures.extend('TextChannel', (): typeof TextChannel => ChannelGatewaysTextChannel);

export { ChannelGatewaysTextChannel };