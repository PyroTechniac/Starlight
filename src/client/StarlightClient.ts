import { AkairoClient, Command, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { ClientApplication, Message, Permissions, PermissionString } from 'discord.js';
import { join } from 'path';
import { Connection } from 'typeorm';
import { createLogger, format, Logger, transports } from 'winston';
import { Setting } from '../models/index';
import database from '../structures/Database';
import TypeORMProvider from '../structures/SettingsProvider';
import { StarlightUtil } from '../util/StarlightUtil';
import { Config } from '../util/Config';
import { config } from 'dotenv';
config();
declare module 'discord-akairo' {
    interface AkairoClient {
        db: Connection;
        settings: TypeORMProvider;
        commandHandler: CommandHandler;
        application: ClientApplication;
        invite: string;
        console: Logger;
    }
}

export default class StarlightClient extends AkairoClient {
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

    public util: StarlightUtil = new StarlightUtil(this);

    public config: Config = new Config(this, {
        token: process.env.TOKEN
    });

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

    public settings!: TypeORMProvider

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
    }

    public async login(): Promise<string> {
        await this._init();
        return super.login(this.config.token);
    }

    public async fetchApplication(): Promise<ClientApplication> {
        this.application = await super.fetchApplication();
        return this.application;
    }
}
