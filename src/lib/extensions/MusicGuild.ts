import { Structures, Guild, Client } from 'discord.js';
import { MusicManager } from '../structures';

export default Structures.extend('Guild', (guild): typeof Guild => {
    return class MusicGuild extends guild {
        public music!: MusicManager
        public constructor(client: Client, data: object) {
            super(client, data);

            this.music = new MusicManager(this);
        }
    };
});

declare module 'discord.js' {
    interface Guild {
        music: MusicManager;
    }
}