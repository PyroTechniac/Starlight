import { AkairoClient, Command, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { ClientApplication, ClientOptions, Message, Permissions, PermissionString } from 'discord.js';
import { config } from 'dotenv';
import { join } from 'path';
import { Connection } from 'typeorm';
import { createLogger, format, Logger, transports } from 'winston';
import { Case, Reminder, Setting } from '../models';
import { CustomEmojiStore } from '../modules/DEmoji';
import { Database as database, MuteScheduler, RemindScheduler, TypeORMProvider } from '../structures';
import { Config, StarlightUtil, Stopwatch } from '../util/';

const { version }: { version: string } = require('../../package.json'); // eslint-disable-line
config();
declare module 'discord-akairo' {
    interface AkairoClient {
        db: Connection;
        settings: TypeORMProvider;
        commandHandler: CommandHandler;
        application: ClientApplication;
        invite: string;
        console: Logger;
        remindScheduler: RemindScheduler;
        config: Config;
        version: string;
        customEmojis: CustomEmojiStore;
    }
}

export default class StarlightClient extends AkairoClient {
    public version: string = version;

    public util: StarlightUtil = new StarlightUtil(this);

    public config: Config = new Config(this, {
        token: process.env.TOKEN
    });

    public customEmojis: CustomEmojiStore = new CustomEmojiStore(this);

    public console: Logger = createLogger({
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
        prefix: (message: Message): string => this.settings.get(message.guild!, 'prefix', this.config.prefix)
    })

    public application!: ClientApplication;

    public db!: Connection

    public remindScheduler!: RemindScheduler;

    public muteScheduler!: MuteScheduler;

    public settings!: TypeORMProvider

    public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
        directory: join(__dirname, '..', 'inhibitors')
    })

    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, '..', 'listeners')
    })

    public constructor(options?: ClientOptions) {
        super(options);
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
        await this.customEmojis.init();
        this.db = database.get('Starlight');
        await this.db.connect();
        this.settings = new TypeORMProvider(this.db.getRepository(Setting));
        await this.settings.init();
        this.remindScheduler = new RemindScheduler(this, this.db.getRepository(Reminder));
        this.muteScheduler = new MuteScheduler(this, this.db.getRepository(Case));
        await this.remindScheduler.init();
        await this.muteScheduler.init();
    }

    public async start(): Promise<string> {
        const timer = new Stopwatch();
        await this._init();
        this.emit('debug', `Loaded in ${timer.stop()}`)
        return this.login(this.config.token);
    }

    public async fetchApplication(): Promise<ClientApplication> {
        this.application = await super.fetchApplication();
        return this.application;
    }
}
