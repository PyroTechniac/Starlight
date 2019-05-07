import {GatewayOptions} from './GatewayOptions';

export interface GatewaysOptions extends Partial<Record<string, GatewayOptions>> {
    clientStorage?: GatewayOptions;
    guilds?: GatewayOptions;
    users?: GatewayOptions;
}