import { Structures } from 'discord.js';

export class StarlightUser extends Structures.get('User') {
    public authenticated: boolean = false;
}