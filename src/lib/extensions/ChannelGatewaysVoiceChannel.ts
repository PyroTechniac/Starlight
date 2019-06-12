import { Structures, VoiceChannel } from 'discord.js';
import { Settings } from 'klasa';

class ChannelGatewaysVoiceChannel extends Structures.get('VoiceChannel') {
    public settings: Settings = this.client.gateways.get(`${this.type}Channels`)!.acquire(this);

    public toJSON(): object {
        return { ...super.toJSON(), settings: this.settings.toJSON() };
    }
}

Structures.extend('VoiceChannel', (): typeof VoiceChannel => ChannelGatewaysVoiceChannel);

export { ChannelGatewaysVoiceChannel };
