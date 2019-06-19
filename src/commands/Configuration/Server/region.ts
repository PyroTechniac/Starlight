import { Command, CommandStore, KlasaMessage, Language } from 'klasa';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 6,
            requiredPermissions: ['MANAGE_GUILD'],
            description: (lang: Language): string => lang.get('COMMAND_REGION_DESCRIPTION'),
            usage: '[region:string]',
            runIn: ['text']
        });
    }

    public async run(message: KlasaMessage, [region]: [string?]): Promise<KlasaMessage | KlasaMessage[]> {
        const regions = await message.guild!.fetchVoiceRegions();
        if (!region) return message.sendLocale('COMMAND_REGION_LIST', [regions.keyArray().map((reg): string => `\`${reg}\``).join(', ')]);
        if (!regions.has(region)) throw message.language.get('COMMAND_REGION_UNAVAILABLE', region, regions.keyArray().map((reg): string => `\`${reg}\``).join(', '));
        if (regions.get(region)!.deprecated) throw message.language.get('COMMAND_REGION_DEPRECATED', region);
        await message.guild!.setRegion(region, `Set by ${message.author!.tag}`);
        return message.sendLocale('COMMAND_REGION_SUCCESS', [region]);
    }
}