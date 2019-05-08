import { Structures, User, Client } from 'discord.js';
import { Client as KClient } from 'klasa';
import { Points } from '../util/Points';

export = Structures.extend('User', (user): typeof User => {
    return class PointsUser extends user {
        public points: Points

        public constructor(client: Client, data: object) {
            super(client, data);

            this.points = new Points(this, (this.client as KClient));
        }
    };
});