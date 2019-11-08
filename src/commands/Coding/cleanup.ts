import {StarlightCommand, StarlightCommandOptions} from '../../lib/structures/StarlightCommand'
import {ApplyOptions} from "../../lib/util/Decorators";
import {PermissionLevels} from "../../lib/types/Enums";
import {KlasaMessage} from "klasa";

@ApplyOptions<StarlightCommandOptions>({
    description: (lang): string => lang.get('COMMAND_CODE_CLEANUP_DESCRIPTION'),
    permissionLevel: PermissionLevels.BotOwner,
    requiredPermissions: ['SEND_MESSAGES']
})
export default class extends StarlightCommand {
    public async run(message:KlasaMessage): Promise<KlasaMessage> {
        await message.sendLocale('COMMAND_CODE_CLEANUP_STARTING');
        await this.client.myriad.cleanup();
        return message.sendLocale('COMMAND_CODE_CLEANUP_COMPLETE');
    }
}