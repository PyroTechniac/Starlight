import { Util } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Possible } from 'klasa';

export type Tag = [string, string];

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            description: 'Allows you to create, remove, or show tags.',
            runIn: ['text'],
            subcommands: true,
            usage: '<add|remove|source|list|show:default> (tag:string) [content:...string]',
            usageDelim: ' '
        });

        this.createCustomResolver('string', (arg: string, possible: Possible, message: KlasaMessage, [action]: [string]): string => {
            if (action === 'list') return arg;
            return this.client.arguments.get('string')!.run(arg, possible, message);
        });
    }

    public async add(message: KlasaMessage, [tag, content]: [string, string]): Promise<KlasaMessage | KlasaMessage[]> {
        await message.guild!.settings.update('tags', [...message.guild!.settings.get('tags') as Tag[], [tag.toLowerCase(), content]], { arrayAction: 'add' });
        return message.send(`Added the tag \`${tag}\` with content: \`\`\`${Util.escapeMarkdown(content)}\`\`\``);
    }

    public async remove(message: KlasaMessage, [tag]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const filtered = (message.guild!.settings.get('tags') as Tag[]).filter(([name]: [string, string]): boolean => name !== tag.toLowerCase());
        await message.guild!.settings.update('tags', filtered, { arrayAction: 'overwrite' });
        return message.send(`Removed the tag \`${tag}\``);
    }

    public list(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        return message.send(`Tags for this guild are: ${(message.guild!.settings.get('tags') as Tag[]).map(([name]: [string, string]): string => name).join(', ')}`);
    }

    public show(message: KlasaMessage, [tag]: [string]): Promise<KlasaMessage | KlasaMessage[]> | null {
        const content = (message.guild!.settings.get('tags') as Tag[]).find(([name]: [string, string]): boolean => name === tag.toLowerCase());
        if (!content) return null;
        return message.send(content[1]);
    }

    public source(message: KlasaMessage, [tag]: [string]): Promise<KlasaMessage | KlasaMessage[]> | null {
        const content = (message.guild!.settings.get('tags') as Tag[]).find(([name]: [string, string]): boolean => name === tag.toLowerCase());
        if (!content) return null;
        return message.send(`\`\`\`${Util.escapeMarkdown(content[1])}\`\`\``);
    }
}