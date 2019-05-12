import { Structures, Guild, Client } from 'discord.js';
import { MusicInterface } from '../structures';

export default Structures.extend('Guild', (guild): typeof Guild => {
    return class StarlightGuild extends guild {
        public constructor(client: Client, data: object) {
            super(client, data);

            this.client.music.add(this);
        }

        public get music(): MusicInterface {
            return this.client.music.add(this);
        }
    };
});

declare module 'discord.js' {
    interface Guild {
        readonly music: MusicInterface;
    }
}