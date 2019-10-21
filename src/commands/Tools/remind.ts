import { Command, CommandOptions, KlasaMessage, util, Timestamp, ScheduledTask, Duration } from 'klasa'
import { ApplyOptions } from '../../lib/util/Decorators';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
    description: "Manage your reminders.",
    bucket: 2,
    cooldown: 30,
    usage: '[list|delete|me] [input:...string]',
    usageDelim: ' '
})
export default class extends Command {

    private timestamp = new Timestamp('YYYY/MM/DD hh:mm:ss');

    public async run(message: KlasaMessage, [action, data]: ['list' | 'delete' | 'me', string?]): Promise<KlasaMessage> {
        if (!data || action === 'list') return this.list(message);
        if (action === 'delete') return this.delete(message, data!);

        const { time, title } = await this.parseInput(message, data);
        const task = await this.client.schedule.create('reminder', Date.now() + time!, {
            catchUp: true,
            data: {
                content: title,
                user: message.author.id,
            }
        });

        return message.send(`Successfully created task ${task.id}`);
    }

    private async list(message: KlasaMessage) {
        const tasks = this.client.schedule.tasks.filter((task): boolean => task.data && task.data.user === message.author.id);
        if (!tasks.length) throw 'You have no active tasks';
        const color = (message.member && message.member.displayColor) || 0xFFAB2D;
        const display = new UserRichDisplay(new MessageEmbed({ color })
            .setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL()));

        const pages = util.chunk(tasks.map((task): string => `\`${task.id}\` - \`${this.timestamp.display(task.time)}\` - ${task.data.content}`), 10);

        pages.forEach((page): void => {
            display.addPage((template: MessageEmbed): MessageEmbed => template.setDescription(page.join('\n')));
        });

        const response = await message.sendEmbed(new MessageEmbed({ description: message.language.get('SYSTEM_LOADING'), color }))
        await display.start(response, message.author.id);
        return response;
    }

    private async delete(message: KlasaMessage, id: string) {
        if (!id) throw "You didn't provide an ID for a task.";
        let selectedTask: ScheduledTask | null = null;
        for (const task of this.client.schedule.tasks) {
            if (task.id !== id) continue;
            if (task.taskName !== 'reminder' || !task.data || task.data.user !== message.author.id) break;
            selectedTask = task;
        }

        if (!selectedTask) throw "Couldn't find a task with that ID.";
        await selectedTask.delete();
        return message.send(`Successfully deleted reminder ${selectedTask.id}`);
    }

    private async parseInput(message: KlasaMessage, input: string) {
        const parsed: { time: number | null, title: string | null } = {
            time: null,
            title: null
        };

        if (/^in\s/.test(input)) {
            const indexOfTitle = input.lastIndexOf(' to ');
            parsed.time = new Duration(input.slice(3, indexOfTitle > -1 ? indexOfTitle : undefined)).offset;
            parsed.title = indexOfTitle > -1 ? input.slice(indexOfTitle + 4) : 'Something, you did not tell me what to remind you.';
        } else {
            const indexOfTime = input.lastIndexOf(' in ');
            parsed.title = input.slice(/^to\s/.test(input) ? 3 : 0, indexOfTime > -1 ? indexOfTime : undefined);

            if (indexOfTime !== -1) {
                parsed.time = new Duration(input.slice(indexOfTime + 4)).offset;
            }
        }

        if (!util.isNumber(parsed.time) || parsed.time < 59500) {
            parsed.time = await this.askTime(message, 'How long until you want to be reminded?');
        }

        return parsed;
    }

    private async askTime(message: KlasaMessage, alert: string): Promise<number> {
        await message.send(alert);

        let time: number;
        let attempts = 0;
        do {
            const messages = await message.channel.awaitMessages((msg: KlasaMessage): boolean => msg.author.equals(message.author), { time: 30000, max: 1 });
            if (!messages.size) throw null;
            time = new Duration(messages.first()!.content).offset;
            attempts++;
        } while (time < 60000 && attempts < 5);

        if (!time || time < 60000) throw 'Reminder time too short.';
        return time;
    }
}