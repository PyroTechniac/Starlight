import { ClientOptions } from 'discord.js';

export interface StarlightOptions extends ClientOptions {
    disableddCorePieces: string[];
    createPiecesFolders: boolean;
}