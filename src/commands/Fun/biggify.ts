import * as jimp from 'jimp';
import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';

export default class BiggifyCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, { description: 'Makes a bigger version of an image' });
    }

    // @ts-ignore
    public async run(msg: KlasaMessage): Promise<void> {
        const { url } = await msg.channel.fetchImage();
        const img = await jimp.read(url);
        const chunkHeight = img.bitmap.height / 4;
        for (let i = 0; i <= 3; i++) {
            const tempImg = img.clone().crop(0, chunkHeight * i, 400, chunkHeight);
            await new Promise((resolve, reject): void => {
                tempImg.getBuffer('image/png', (err, buffer): void => err ?
                    reject(err) :
                    resolve(msg.channel.sendFile(buffer, 'image.png')));
            });
        }
    }
}