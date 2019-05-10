import { Command, CommandStore, KlasaClient, KlasaMessage, CommandOptions } from 'klasa';

export interface MusicCommandOptions extends CommandOptions {
    requireMusic?: boolean;
}

export abstract class MusicCommand extends Command {
    public requireMusic: boolean;
    public static YOUTUBE_REGEX: RegExp =  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string, { requireMusic = false, ...options }: MusicCommandOptions) {
        if ('runIn' in options) options.runIn = ['text'];

        super(client, store, file, directory, options);

        this.requireMusic = requireMusic;
    }

    public abstract async run(msg: KlasaMessage, ...args: any[]): Promise<KlasaMessage | KlasaMessage[]>
}