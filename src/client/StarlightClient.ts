import { CategoryChannel, Collection, DMChannel, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';
import { Client, Gateway, KlasaClientOptions, KlasaMessage, KlasaUser, Piece, Schema, Settings, Stopwatch, Type, util } from 'klasa';
import { inspect } from 'util';
import { List, Util } from '../lib';
import './StarlightPreload';

Client.defaultCategoryChannelSchema = new Schema();
Client.defaultTextChannelSchema = new Schema();
Client.defaultVoiceChannelSchema = new Schema();

declare module 'discord.js' {
    interface Client {
        readonly dms: Collection<string, DMChannel>;
        readonly voices: Collection<string, VoiceChannel>;
        readonly stores: Collection<string, StoreChannel>;
        readonly texts: Collection<string, TextChannel>;
        readonly news: Collection<string, NewsChannel>;
        readonly categories: Collection<string, CategoryChannel>;
    }

    interface CategoryChannel {
        settings: Settings;
    }

    interface TextChannel {
        fetchImage(limit: number): Promise<MessageAttachment | null>;
        settings: Settings;
    }

    interface VoiceChannel {
        settings: Settings;
    }

    interface DMChannel {
        fetchImage(limit: number): Promise<MessageAttachment | null>;
    }

    interface Message {
        unreact(emojiID: string): Promise<MessageReaction | null>;
        readonly settings: Settings;
    }
}

declare module 'klasa' {
    namespace Client {
        export let defaultTextChannelSchema: Schema;
        export let defaultVoiceChannelSchema: Schema;
        export let defaultCategoryChannelSchema: Schema;
    }

    interface Client {
        eval(message: KlasaMessage, code: string): Promise<{
            result: string;
            type: Type;
            success: boolean;
            time: string;
        }>;

        [Symbol.iterator](): IterableIterator<Piece>;
    }
}

export class StarlightClient extends Client {
    public constructor(options?: KlasaClientOptions) {
        super(options);
        this
            .gateways
            .register(new Gateway(this, 'textChannels', { schema: Client.defaultTextChannelSchema }))
            .register(new Gateway(this, 'categoryChannels', { schema: Client.defaultCategoryChannelSchema }))
            .register(new Gateway(this, 'voiceChannels', { schema: Client.defaultVoiceChannelSchema }));
    }

    public get owners(): List<KlasaUser> {
        return new List([...super.owners.values()]);
    }

    public get dms(): Collection<string, DMChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'dm') as Collection<string, DMChannel>;
    }

    public get voices(): Collection<string, VoiceChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'voice') as Collection<string, VoiceChannel>;
    }

    public get texts(): Collection<string, TextChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'text') as Collection<string, TextChannel>;
    }

    public get news(): Collection<string, NewsChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'news') as Collection<string, NewsChannel>;
    }

    public get stores(): Collection<string, StoreChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'store') as Collection<string, StoreChannel>;
    }

    public get categories(): Collection<string, CategoryChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'category') as Collection<string, CategoryChannel>;
    }

    public async destroy(): Promise<void> {
        await Promise.all(this.providers.map((provider): Promise<void> => provider.shutdown()));
        return super.destroy();
    }

    public async eval(message: KlasaMessage, code: string): Promise<{
        result: string;
        time: string;
        type: Type;
        success: boolean;
    }> {
        const msg = message;
        const { flags } = message;
        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, '\'');
        const stopwatch = new Stopwatch();
        let success: boolean, syncTime: string, asyncTime: string, result: string;
        let thenable = false;
        let type: Type;
        try {
            if (flags.async) code = `(async () => {\n${code}\n})();`;
            result = eval(code);
            syncTime = stopwatch.toString();
            type = new Type(result);
            if (util.isThenable(result)) {
                thenable = true;
                stopwatch.restart();
                result = await result;
                asyncTime = stopwatch.toString();
            }
            success = true;
        } catch (error) {
            if (!syncTime!) syncTime = stopwatch.toString();
            if (!type!) type = new Type(error);
            if (thenable && !asyncTime!) asyncTime = stopwatch.toString();
            if (error && error.stack) this.emit('error', error.stack);
            result = error;
            success = false;
        }

        stopwatch.stop();
        if (typeof result !== 'string') {
            result = inspect(result, {
                depth: flags.depth ? Number.parseInt(flags.depth) || 0 : 0,
                showHidden: Boolean(flags.showHidden)
            });
        }
        return { success, type: type!, time: Util.formatTime(syncTime!, asyncTime!), result: util.clean(result) };
    }

    public *[Symbol.iterator](): IterableIterator<Piece> {
        for (const store of this.pieceStores.values()) yield* store.values();
    }
}