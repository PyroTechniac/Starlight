import { KlasaClient } from 'klasa';
import { Node } from 'veza';
import './MoonlightPreload';
import { Collection } from 'discord.js';


export class MoonlightClient extends KlasaClient {
    public node: Node = new Node('Moonlight');

    public clients: Collection<string, any> = new Collection();
}