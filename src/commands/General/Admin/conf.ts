import { Command, CommandStore, KlasaMessage, Language, Possible, Schema, SchemaEntry, SettingsFolderUpdateResult, util } from 'klasa';
const { toTitleCase, codeBlock } = util;

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            runIn: ['text'],
            permissionLevel: 6,
            guarded: true,
            subcommands: true,
            description: (lang: Language): string => lang.get('COMMAND_CONF_SERVER_DESCRIPTION'),
            usage: '<set|show|remove|reset> (key:key) (value:value)',
            usageDelim: ' '
        });
        this
            .createCustomResolver('key', (arg: string, possible: Possible, message: KlasaMessage, [action]: [string]): string => {
                if (action === 'show' || arg) return arg;
                throw message.language.get('COMMAND_CONF_NOKEY');
            })
            .createCustomResolver('value', (arg: string, possible: Possible, message: KlasaMessage, [action]: [string]): string | null => {
                if (!['set', 'remove'].includes(action)) return null;
                if (arg) return this.client.arguments.get('...string')!.run(arg, possible, message);
                throw message.language.get('COMMAND_CONF_NOVALUE');
            });
    }

    public show(message: KlasaMessage, [key]: [string?]): Promise<KlasaMessage | KlasaMessage[]> {
        const entry = this.getPath(key);
        if (!entry || (entry.type === 'Folder' ? !(entry as Schema).configurableKeys.length : !(entry as SchemaEntry).configurable)) return message.sendLocale('COMMAND_CONF_GET_NOEXT', [key]);
        if (entry.type === 'Folder') {
            return message.sendLocale('COMMAND_CONF_SERVER', [
                key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '',
                codeBlock('asciidoc', message.guild!.settings.display(message, entry))
            ]);
        }
        return message.sendLocale('COMMAND_CONF_GET', [entry.path, message.guild!.settings.display(message, entry)]);
    }

    public async set(message: KlasaMessage, [key, valueToSet]: [string, any]): Promise<KlasaMessage | KlasaMessage[]> {
        const entry = this.check(message, key, await message.guild!.settings.update(key, valueToSet, { onlyConfigurable: true, arrayAction: 'add' }));
        return message.sendLocale('COMMAND_CONF_UPDATED', [key, message.guild!.settings.display(message, entry)]);
    }

    public async remove(message: KlasaMessage, [key, valueToRemove]: [string, any]): Promise<KlasaMessage | KlasaMessage[]> {
        const entry = this.check(message, key, await message.guild!.settings.update(key, valueToRemove, { onlyConfigurable: true, arrayAction: 'remove' }));
        return message.sendLocale('COMMAND_CONF_UPDATED', [key, message.guild!.settings.display(message, entry)]);
    }

    public async reset(message: KlasaMessage, [key]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const entry = this.check(message, key, await message.guild!.settings.reset(key));
        return message.sendLocale('COMMAND_CONF_RESET', [key, message.guild!.settings.display(message, entry)]);
    }

    private check(message: KlasaMessage, key: string, { errors, updated }: SettingsFolderUpdateResult): SchemaEntry {
        if (errors.length) throw String(errors[0]);
        if (!updated.length) throw message.language.get('COMMAND_CONF_NOCHANGE', key);
        return updated[0].entry;
    }

    private getPath(key?: string): Schema | SchemaEntry | undefined {
        const { schema } = this.client.gateways.get('guilds')!;
        if (!key) return schema;
        try {
            return schema.get(key);
        } catch (_) {
            return undefined;
        }
    }
}