import { Client, Collection, User, UserResolvable } from 'discord.js';
import { Canvas } from './Canvas';

export class CanvasStore extends Collection<string, Canvas> {
    public readonly client!: Client;
    public readonly holds: typeof Canvas = Canvas;
    public constructor(client: Client) {
        super();
        Object.defineProperty(this, 'client', { value: client });
    }

    public add(user: UserResolvable): Canvas {
        const resolvedUser: User = this.client.users.resolve(user);
        const canvas = this.get(resolvedUser.id) || new Canvas();
        this.set(resolvedUser.id, canvas);
        return canvas;
    }

    private getUser(user: UserResolvable): string {
        return this.client.users.resolve(user).id;
    }

    public save(user: UserResolvable, canvas?: Canvas): Canvas {
        canvas = canvas || this.get(this.client.users.resolve(user).id) || new Canvas();
        this.set(this.getUser(user), canvas);
        return canvas;
    }

    public invert(user: UserResolvable): Canvas {
        const canvas = this.add(user);
        return this.save(user, canvas
            .save()
            .setGlobalCompositionOperation('difference')
            .setColor('white')
            .addRect(0, 0, canvas.width, canvas.height)
            .restore());
    }

    public greyscale(user: UserResolvable): Canvas {
        const canvas = this.add(user);
        return this.save(user, canvas
            .save()
            .setGlobalCompositionOperation('hsl-saturation')
            .setColor('white')
            .addRect(0, 0, canvas.width, canvas.height)
            .restore());
    }

    public grayscale(user: UserResolvable): Canvas {
        return this.greyscale(user);
    }

    public invertGreyscale(user: UserResolvable): Canvas {
        const canvas = this.add(user);
        return this.save(user, canvas
            .save()
            .setGlobalCompositionOperation('hsl-saturation')
            .setColor('white')
            .addRect(0, 0, canvas.width, canvas.height)
            .setGlobalCompositionOperation('difference')
            .setColor('white')
            .addRect(0, 0, canvas.width, canvas.height)
            .restore());
    }

    public invertGrayscale(user: UserResolvable): Canvas {
        return this.invertGreyscale(user);
    }

    public sepia(user: UserResolvable): Canvas {
        const canvas = this.add(user);
        const imageData = canvas.getImageData();
        // @ts-ignore
        const { data } = imageData;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
        }

        // @ts-ignore
        return this.save(user, canvas.putImageData(imageData, 0, 0));
    }

    public silhouette(user: UserResolvable): Canvas {
        const canvas = this.add(user);
        const imageData = canvas.getImageData();
        // @ts-ignore
        const { data } = imageData;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = 0;
        }

        // @ts-ignore
        return this.save(user, canvas.putImageData(imageData, 0, 0));
    }

    public threshold(user: UserResolvable, threshold: number): Canvas {
        const canvas = this.add(user);
        const imageData = canvas.getImageData();
        // @ts-ignore
        const { data } = imageData;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = (0.2126 * data[i]) + (0.7152 * data[i + 1]) + (0.0722 * data[i + 2]) >= threshold ? 255 : 0;
        }

        // @ts-ignore
        return this.save(user, canvas.putImageData(imageData, 0, 0));
    }

    public invertedThreshold(user: UserResolvable, threshold: number): Canvas {
        const canvas = this.add(user);
        const imageData = canvas.getImageData();
        // @ts-ignore
        const { data } = imageData;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = (0.2126 * data[i]) + (0.7152 * data[i + 1]) + (0.0722 * data[i + 2]) >= threshold ? 0 : 255;
        }

        // @ts-ignore
        return this.save(user, canvas.putImageData(imageData, 0, 0));
    }

    public brightness(user: UserResolvable, brightness: number): Canvas {
        const canvas = this.add(user);
        return this.save(user, canvas
            .save()
            .setGlobalAlpha(brightness / 100)
            .setColor('white')
            .addRect(0, 0, canvas.width, canvas.height)
            .restore());
    }

    public darkness(user: UserResolvable, darkness: number): Canvas {
        const canvas = this.add(user);
        return this.save(user, canvas
            .save()
            .setGlobalAlpha(darkness / 100)
            .setColor('black')
            .addRect(0, 0, canvas.width, canvas.height)
            .restore());
    }

    public myOldFriend(user: UserResolvable, darkness: number): Canvas {
        return this.darkness(user, darkness);
    }

    public sharpen(user: UserResolvable, [edge, center]: [number, number]): Canvas {
        return this.convolute(user, [0, edge, 0, edge, center, edge, 0, edge, 0]);
    }

    public blur(user: UserResolvable, amount: number): Canvas {
        return this.convolute(user, new Array(9).fill(1 / amount));
    }

    public convolute(user: UserResolvable, weights: number[]): Canvas {
        const canvas = this.add(user);
        const side = 3 | 0, halfSide = (3 / 2) | 0;
        const imageData = canvas.getImageData();
        // @ts-ignore
        const { data } = imageData;
        const { width, height } = canvas;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dstOff = ((y * width) + x) * 4;
                // calculate the weighed sum of the source image pixels that
                // fall under the convolution matrix
                let r = 0, g = 0, b = 0; // eslint-disable-line
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        const scy = y + cy - halfSide, scx = x + cx - halfSide;
                        if (scy < 0 || scy >= height || scx < 0 || scx >= width) continue; // eslint-disable-line max-depth
                        const srcOff = ((scy * width) + scx) * 4;
                        const wt = weights[(cy * side) + cx];
                        r += data[srcOff] * wt;
                        g += data[srcOff + 1] * wt;
                        b += data[srcOff + 2] * wt;
                    }
                }
                data[dstOff] = r;
                data[dstOff + 1] = g;
                data[dstOff + 2] = b;
            }
        }

        // @ts-ignore
        return this.save(user, canvas.putImageData(imageData, 0, 0));
    }
}