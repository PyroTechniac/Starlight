import { ClientOptions } from 'discord.js';
import { GatewaysOptions } from './GatewaysOptions';
import { CustomPromptDefaults } from './CustomPromptDefaults';
import { ConsoleOptions } from './ConsoleOptions';
import { ConsoleEvents } from './ConsoleEvents';

export interface StarlightClientOptions extends ClientOptions {
    commandEditing?: boolean;
    commandLogging?: boolean;
    commandMessageLifetime?: number;
    console?: ConsoleOptions;
    consoleEvents?: ConsoleEvents;
    createPiecesFolders?: boolean;
    customPromptDefaults?: CustomPromptDefaults;
    disabledCorePieces?: string[];
    gateways?: GatewaysOptions;
    language?: string;
    noPrefixDM?: boolean;
    ownerID?: string;
    permissionLevels?: PermissionLevels;
    pieceDefaults?: PieceDefaults;
    prefix?: string | string[];
    prefixCaseInsensitive?: boolean;
    preserveSettings?: boolean;
    production?: boolean;
    providers?: ProvidersOptions;
    readyMessage?: ReadyMessage;
    regexPrefix?: RegExp;
    schedule?: ScheduleOptions;
    slowmode?: number;
    slowmodeAggressive?: boolean;
    typing?: boolean;
}