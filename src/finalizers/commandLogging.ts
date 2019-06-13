import { Colors, Command, Finalizer, Stopwatch } from 'klasa';
import { StarlightMessage } from '../lib/extensions';

export default class extends Finalizer {
    private reprompted: [Colors, Colors] = [new Colors({ background: 'blue' }), new Colors({ background: 'red' })];

    private user: Colors = new Colors({ background: 'yellow', text: 'black' });

    private shard: Colors = new Colors({ background: 'cyan', text: 'black' })

    private channel: { text: Colors; dm: Colors } = {
        text: new Colors({ background: 'green', text: 'black' }),
        dm: new Colors({ background: 'magenta' })
    }

    public async run(message: StarlightMessage, command: Command, response: StarlightMessage | StarlightMessage[], timer: Stopwatch): Promise<void> {
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

    public async init(): Promise<void> {
        this.enabled = this.client.options.commandLogging;
    }

    private text(message: StarlightMessage): string {
        return `${message.guild!.name}[${message.guild!.id}]`;
    }

    private dm(): string {
        return 'Direct Messages';
    }
}