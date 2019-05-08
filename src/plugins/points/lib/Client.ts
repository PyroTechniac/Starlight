import { KlasaClient, KlasaClientOptions, util } from 'klasa';
import { join } from 'path';
import './schemas/UserSchema';
import { Points } from './util/Points';
import { OPTIONS } from './util/Constants';


const coreDirectory = join(__dirname, '..', '/');


export class PointsClient extends KlasaClient {
    public constructor(options?: KlasaClientOptions) {
        super(options);
        // @ts-ignore
        this.constructor[KlasaClient.plugin].call(this);
    }

    public static [KlasaClient.plugin](this: PointsClient): void {
        util.mergeDefault(OPTIONS, this.options);

        // @ts-ignore
        this.commands.registerCoreDirectory(coreDirectory);

        // @ts-ignore
        this.finalizers.registerCoreDirectory(coreDirectory);

        // @ts-ignore
        this.events.registerCoreDirectory(coreDirectory);

        // @ts-ignore
        this.monitors.registerCoreDirectory(coreDirectory);

        // @ts-ignore
        this.inhibitors.registerCoreDirectory(coreDirectory);
    }
}

declare module 'discord.js' {
    interface ClientOptions {
        points?: {
            cooldown: number;
            defaultPrice: number;
            enabled: boolean;
            initialAmount: number | null;
            maxAdd: number;
            minAdd: number;
            pointAcquisitionBucket: number;
        };
    }

    interface User {
        points: Points;
    }
}