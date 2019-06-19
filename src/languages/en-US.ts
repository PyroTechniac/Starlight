import { Language, LanguageStore } from 'klasa';

export default class extends Language {
    public constructor(store: LanguageStore, file: string[], directory: string) {
        super(store, file, directory);

        this.language = {
            COMMAND_PREFIX_DESCRIPTION: 'Change the command prefix the bot uses in your server.',
            COMMAND_PREFIX_RESET: `Switched back the guild's prefix to ${this.client.options.prefix!}.`,
            COMMAND_PREFIX_REMINDER: (prefix: string): string => `The prefix for this guild is \`${prefix}\`.`,
            COMMAND_PREFIX_CHANGE: (prefix: string): string => `The prefix for this guild has been set to \`${prefix}\`.`,
            COMMAND_REGION_DESCRIPTION: 'Changes the guild\'s voice region.',
            COMMAND_REGION_UNAVAILABLE: (oldRegion: string, regions: string): string => `The \`${oldRegion}\` region is unavailable, please choose from the following: ${regions}.`,
            COMMAND_REGION_DEPRECATED: (region: string): string => `The \`${region}\` region is deprecated.`,
            COMMAND_REGION_SUCCESS: (region: string): string => `Successfully set the region to \`${region}\``,
            COMMAND_REGION_LIST: (regions: string): string => `The available regions for this guild are: ${regions}`
        };
    }
}