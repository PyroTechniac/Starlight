import { AkairoClient, Command, CommandHandler, Flag, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { ClientApplication, Message, Permissions, PermissionString, Util } from 'discord.js';
import { join } from 'path';
import { Connection } from 'typeorm';
import { createLogger, format, Logger, transports } from 'winston';
import { Setting, Tag, Reminder } from '../models/index';
import database from '../structures/Database';
import TypeORMProvider from '../structures/SettingsProvider';
import { StarlightUtil } from '../util/StarlightUtil';
import RemindScheduler from '../structures/RemindScheduler';

declare module 'discord-akairo' {
    interface AkairoClient {
        db: Connection;
        settings: TypeORMProvider;
        commandHandler: CommandHandler;
        logger: Logger;
        application: ClientApplication;
        cachedCases: Set<string>;
        defaultEmbedColor: [number, number, number];
        invite: string;
    }
}

export default class StarlightClient extends AkairoClient {
    public logger = createLogger({
        format: format.combine(
            format.colorize({ level: true }),
            format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
            format.printf((info: any): string => {
                const { timestamp, level, message, ...rest } = info;
                return `[${timestamp}] ${level}: ${message}${Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''}`;
            })
        ),
        transports: [
            new transports.Console({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' })
        ]
    })

    public util: StarlightUtil = new StarlightUtil(this);

    public commandHandler: CommandHandler = new CommandHandler(this, {
        directory: join(__dirname, '..', 'commands'),
        commandUtil: true,
        handleEdits: true,
        commandUtilLifetime: 3e5,
        defaultCooldown: 3000,
        argumentDefaults: {
            prompt: {
                modifyStart: (_, str): string => `${str}\n\nType \`cancel\` to cancel the command`,
                modifyRetry: (_, str): string => `${str}\n\nType \`cancel\` to cancel the command`,
                timeout: 'Command timed out, please try again',
                ended: 'Command cancelled due to too many tries',
                cancel: 'Command has been cancelled',
                retries: 3,
                time: 30000
            },
            otherwise: ''
        },
        aliasReplacement: /-/g,
        prefix: (message: Message): string => this.settings.get(message.guild!, 'prefix', process.env.PREFIX)
    })

    public application!: ClientApplication;

    public db!: Connection

    public settings!: TypeORMProvider

    public cachedCases = new Set();

    public remindScheduler: RemindScheduler;

    public defaultEmbedColor: [number, number, number] = [132, 61, 164]

    public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
        directory: join(__dirname, '..', 'inhibitors')
    })

    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, '..', 'listeners')
    })

    public constructor() {
        super({
            disableEveryone: true,
            disabledEvents: ['TYPING_START']
        });

        this.commandHandler.resolver.addType('tag', async (message, phrase): Promise<any> => {
            if (!phrase) return Flag.fail(phrase);
            phrase = Util.cleanContent(phrase.toLowerCase(), message);
            const tagsRepo = this.db.getRepository(Tag);
            const tags = await tagsRepo.find();

            const [tag] = tags.filter((t): boolean => t.name === phrase || t.aliases.includes(phrase));

            return tag || Flag.fail(phrase);
        });
        this.commandHandler.resolver.addType('existingTag', async (message, phrase): Promise<any> => {
            if (!phrase) return Flag.fail(phrase);
            phrase = Util.cleanContent(phrase.toLowerCase(), message);
            const tagsRepo = this.db.getRepository(Tag);

            const tags = await tagsRepo.find();
            const [tag] = tags.filter((t): boolean => t.name === phrase || t.aliases.includes(phrase));

            return tag ? Flag.fail(phrase) : phrase;
        });
        this.commandHandler.resolver.addType('tagContent', async (message, phrase): Promise<any> => {
            if (!phrase) phrase = '';
            phrase = Util.cleanContent(phrase, message);
            if (message.attachments.first()) phrase += `\n${message.attachments.first()!.url}`;

            return phrase || Flag.fail(phrase);
        });
    }

    public static basePermissions: Permissions = new Permissions(['SEND_MESSAGES', 'VIEW_CHANNEL'])

    public get invite() {
        const permissions = new Permissions(StarlightClient.basePermissions).add(...this.commandHandler.modules.map((command: Command) => command.clientPermissions as PermissionString)).bitfield;
        return `https://discordapp.com/oauth2/authorize?client_id=${this.application.id}&permissions=${permissions}&scope=bot`;
    }

    private async _init(): Promise<void> {
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
            inhibitorHandler: this.inhibitorHandler,
            process: process
        });
        this.commandHandler.loadAll();
        this.inhibitorHandler.loadAll();
        this.listenerHandler.loadAll();

        this.db = database.get('Starlight');
        await this.db.connect();
        this.settings = new TypeORMProvider(this.db.getRepository(Setting));
        await this.settings.init();
        this.remindScheduler = new RemindScheduler(this, this.db.getRepository(Reminder));
        await this.remindScheduler.init();
    }

    public async start(): Promise<string> {
        await this._init();
        return this.login(process.env.TOKEN);
    }

    public async fetchApplication(): Promise<ClientApplication> {
        this.application = await super.fetchApplication();
        return this.application;
    }
}
