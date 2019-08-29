import {KlasaClient} from 'klasa'
import {resolve} from 'path'

export class CanvasClient extends KlasaClient {
    public constructor(options?: KlasaClientOptions) {
        super(options);
        // @ts-ignore
        this.constructor[KlasaClient.plugin].call(this);
    }

    public static [KlasaClient.plugin](this: CanvasClient) {
        const coreDirectory = resolve('')
    }
}