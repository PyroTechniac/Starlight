import StarlightClient from '../../client/StarlightClient';


export interface CloseEvent {
    code: number;
    reason: string;
    wasClean: boolean;
}

export abstract class BaseCluster {
    public readonly client: StarlightClient;
    public readonly id: number;
}
