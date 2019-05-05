import { SharedProviderStorage } from './SharedProviderStorage';
import { default as Client } from '../client/StarlightClient';
import { Guild } from 'discord.js';
import { StorageProvider } from './StorageProvider';

export class GuildStorage extends SharedProviderStorage {
    public constructor(client: Client, guild: Guild, storageProvider: StorageProvider, settingsProvider: StorageProvider) {
        super(storageProvider, guild.id);
    }
}
