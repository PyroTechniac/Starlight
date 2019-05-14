import { Colors, Command, Finalizer, FinalizerStore, KlasaClient, KlasaMessage, Stopwatch } from 'klasa';

export default class CommandLoggingFinalizer extends Finalizer {
    public constructor(client: KlasaClient, store: FinalizerStore, file: string[], directory: string) {
        super(client, store, file, directory);
    }
    private reprompted: [Colors, Colors] = [new Colors({ background: 'blue' }), new Colors({ background: 'red' })]
    private user: Colors = new Colors({ background: 'yellow', text: 'black' })
    private shard: Colors = new Colors({ background: 'cyan', text: 'black' })
    private channel: { [key: string]: Colors } = {
        text: new Colors({ background: 'green', text: 'black' }),
        dm: new Colors({ background: 'magenta' })
    }

    public run(message: KlasaMessage, command: Command, response: KlasaMessage | KlasaMessage[], timer: Stopwatch): void {
        const { type } = message.channel;
        const shard = message.guild ? message.guild.shardID : 0;
        this.client.emit('log', [
            this.shard.format(`[${shard}]`),
            `${command.name}(${message.args ? message.args.join(', ') : ''})`,
            this.reprompted[Number(message.reprompted)].format(`[${timer.stop()}]`),
            this.user.format(`${message.author!.username}[${message.author!.id}]`),
            this.channel[type].format(this[type](message))
        ].join(' '));
    }

    public init(): any {
        this.enabled = this.client.options.commandLogging;
    }

    private text(message: KlasaMessage): string {
        return `${message.guild!.name}[${message.guild!.id}]`;
    }

    private dm(): string {
        return 'Direct Message';
    }
}