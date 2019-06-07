import { Command, CommandStore, RichDisplay, util, Language, Possible, KlasaMessage, ReactionHandler } from 'klasa';
import { Permissions, TextChannel } from 'discord.js';
const { isFunction } = util;

const time = 1000 * 60 * 3;
const PERMISSIONS_RICHDISPLAY = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);

export default class extends Command {
    private handlers: Map<string, ReactionHandler>;
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['commands', 'cmd', 'cmds'],
            guarded: true,
            description: (language: Language): string => language.get('COMMAND_HELP_DESCRIPTION'),
            usage: '(Command:command)'
        });

        this.createCustomResolver('command', (arg: string, possible: Possible, message: KlasaMessage): Command | undefined => {
            if (!arg || arg === '') return undefined;
            return this.client.arguments.get('command').run(arg, possible, message);
        });
        this.handlers = new Map<string, ReactionHandler>();
    }

    // @ts-ignore
    public async run(message: KlasaMessage, [command]: [Command?]): Promise<KlasaMessage | KlasaMessage[] | ReactionHandler | void> {
        if (command) {
            return message.sendMessage([
                `= ${command.name} = `,
                isFunction(command.description) ? command.description(message.language) : command.description,
                message.language.get('COMMAND_HELP_USAGE', command.usage.fullUsage(message)),
                message.language.get('COMMAND_HELP_EXTENDED'),
                isFunction(command.extendedHelp) ? command.extendedHelp(message.language) : command.extendedHelp
            ], { code: 'asciidoc' });
        }

        if (!('all' in message.flags) && message.guild && (message.channel as TextChannel).permissionsFor(this.client.user!)!.has(PERMISSIONS_RICHDISPLAY)) {
            // Finish the previous handler
            const previousHandler = this.handlers.get(message.author!.id);
            if (previousHandler) previousHandler.stop();

            const handler = await (await this.buildDisplay(message)).run(await message.send('Loading Commands...') as KlasaMessage, {
                filter: (reaction, user): boolean => user.id === message.author!.id,
                time
            });
            handler.on('end', (): boolean => this.handlers.delete(message.author!.id));
            this.handlers.set(message.author!.id, handler);
            return handler;
        }

        return message.author!.send(await this.buildHelp(message), { split: { char: '\n' } })
            .then((): KlasaMessage | void => { if (message.channel.type !== 'dm') message.sendMessage(message.language.get('COMMAND_HELP_DM')); })
            .catch((): KlasaMessage | void => { if (message.channel.type !== 'dm') message.sendMessage(message.language.get('COMMAND_HELP_NODM')); });
    }

    private async buildHelp(message: KlasaMessage): Promise<string> {
        const commands = await this._fetchCommands(message);
        const prefix: string = message.guildSettings.get('prefix')! as string;
        const helpMessage: string[] = [];
        for (const [category, list] of commands) {
            helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, message, prefix, false)).join('\n'), '');
        }

        return helpMessage.join('\n');
    }

    private async buildDisplay(message: KlasaMessage): Promise<RichDisplay> {
        const commands = await this._fetchCommands(message);
        const prefix: string = message.guildSettings.get('prefix')! as string;
        const display = new RichDisplay();
        const color = message.member!.displayColor;
        for (const [category, list] of commands) {
            display.addPage(this.client.util.embed()
                .setTitle(`${category} Commands`)
                .setColor(color)
                .setDescription(list.map(this.formatCommand.bind(this, message, prefix, true)).join('\n'))
            );
        }

        return display;
    }

    private formatCommand(message: KlasaMessage, prefix: string, richDisplay: boolean, command: Command): string {
        const description = isFunction(command.description) ? command.description(message.language) : command.description;
        return richDisplay ? `• ${prefix}${command.name} → ${description}` : `• **${prefix}${command.name}** → ${description}`;
    }

    private async _fetchCommands(message: KlasaMessage): Promise<Map<string, Command[]>> {
        const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
        const commands: Map<string, Command[]> = new Map();
        await Promise.all(this.client.commands.map((command): any => run(command, true)
            .then((): any => {
                const category = commands.get(command.category);
                if (category) category.push(command);
                else commands.set(command.category, [command]);
            })
            .catch((): void => {
                // noop
            })
        ));

        return commands;
    }
}