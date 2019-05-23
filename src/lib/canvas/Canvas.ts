import { browser, getFontHeight, InternalCanvas, textWrap } from './Util';
import { Image } from 'canvas';

interface ImageOptions {
    radius?: number;
    type?: 'bevel' | 'round';
    restore?: boolean;
}

type fillRule = 'nonzero' | 'evenodd'

const createCanvas = browser
    ? (): null => null
    : typeof InternalCanvas.createCanvas === 'function'
        ? InternalCanvas.createCanvas
        : (...args: any[]): any => new InternalCanvas(...args);

export class Canvas {
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D | null;
    public constructor(...args: any[]) {
        this.canvas = createCanvas(...args);

        this.context = this.canvas ? this.canvas.getContext('2d') : null;
    }

    public get width(): number {
        return this.canvas.width;
    }

    public set width(val: number) {
        this.canvas.width = val;
    }

    public get height(): number {
        return this.canvas.height;
    }

    public set height(val: number) {
        this.canvas.height = val;
    }

    public get textFontHeight(): number {
        return getFontHeight(this.context!.font);
    }

    public changeCanvasSize(width: number, height: number): this {
        return this
            .changeCanvasWidth(width)
            .changeCanvasHeight(height);
    }

    public changeCanvasWidth(width: number): this {
        this.width = width;
        return this;
    }

    public changeCanvasHeight(height: number): this {
        this.height = height;
        return this;
    }

    public save(): this {
        this.context!.save();
        return this;
    }

    public restore(): this {
        this.context!.restore();
        return this;
    }

    public rotate(...args: [number]): this {
        this.context!.rotate(...args);
        return this;
    }

    public scale(...args: [number, number]): this {
        this.context!.scale(...args);
        return this;
    }

    public translate(...args: [number, number]): this {
        this.context!.scale(...args);
        return this;
    }

    public clip(...args: [any?, fillRule?]): this {
        this.context!.clip(...args);
        return this;
    }

    public setTransform(...args: [number, number, number, number, number, number]): this {
        this.context!.setTransform(...args);
        return this;
    }

    public resetTransformation(): this {
        return this.setTransform(1, 0, 0, 1, 0, 0);
    }

    public getImageData(dx: number = 0, dy: number = 0, width: number = this.width, height: number = this.height, callback?: Function): this | ImageData {
        if (typeof dx === 'function') {
            callback = dx;
            dx = 0;
        }
        if (callback) {
            if (typeof callback !== 'function') throw new TypeError('Callback must be a function');
            callback.call(this, this.context!.getImageData(dx, dy, width, height), this);
        }
        return this.context!.getImageData(dx, dy, width, height);
    }

    public putImageData(...args: [ImageData, number, number, number, number, number, number]): this {
        this.context!.putImageData(...args);
        return this;
    }

    public fill(...args: [any?, fillRule?]): this {
        this.context!.fill(...args);
        return this;
    }

    public addText(...args: [string, number, number, number?]): this {
        this.context!.fillText(...args);
        return this;
    }

    public addResponsiveText(text: string, dx: number, dy: number, maxWidth: number): this {
        const [, style = '', size, font] = /(\w+ )?(\d+)(.+)/.exec(this.context!.font)!;
        const currentSize = Number.parseInt(size);
        const { width } = this.measureText(text);
        const newLength = maxWidth > width ? currentSize : (maxWidth / width) * currentSize;
        return this
            .setTextFont(style + newLength + font)
            .addText(text, dx, dy);
    }

    public addMultilineText(text: string, dx: number, dy: number): this {
        const lines = text.split(/\r?\n/);

        if (lines.length <= 1) return this.addText(text, dx, dy);

        const height = this.textFontHeight;

        let linePositionY = dy;
        for (const line of lines) {
            this.addText(line, dx, Math.floor(linePositionY));
            linePositionY += height;
        }

        return this;
    }

    public addWrappedText(text: string, dx: number, dy: number, wrapWidth: number): this {
        const wrappedText = textWrap(this, text, wrapWidth);
        return this.addMultilineText(wrappedText, dx, dy);
    }

    public stroke(...args: [any]): this {
        this.context!.stroke(...args);
        return this;
    }

    public addStrokeRect(...args: [number, number, number, number]): this {
        this.context!.strokeRect(...args);
        return this;
    }

    public addStrokeText(...args: [string, number, number]): this {
        this.context!.strokeText(...args);
        return this;
    }

    public measureText(text: string, callback?: Function): Canvas | TextMetrics {
        if (callback) {
            if (typeof callback !== 'function') throw new TypeError('Callback must be a function');
            callback.call(this, this.context!.measureText(text), this);
            return this;
        }
        return this.context!.measureText(text);
    }

    public setTextSize(size: number): this {
        const [, style = '', font] = /(\w+ )?(?:\d+)(.+)/.exec(this.context!.font)!;
        return this.setTextFont(style + size + font);
    }

    public setStroke(color: string = '#000000'): this {
        this.context!.strokeStyle = color;
        return this;
    }

    public setLineWidth(width: number = 1): this {
        this.context!.lineWidth = width;
        return this;
    }

    public setStrokeWidth(width: number): this {
        return this.setLineWidth(width);
    }

    public setLineDashOffset(value: number): this {
        this.context!.lineDashOffset = value;
        return this;
    }

    public setLineJoin(value: 'bevel' | 'round' | 'miter'): this {
        this.context!.lineJoin = value;
        return this;
    }

    public setLineCap(value: 'butt' | 'round' | 'square'): this {
        this.context!.lineCap = value;
        return this;
    }

    public setLineDash(...args: number[]): this {
        // @ts-ignore
        this.context!.setLineDash(...args);
        return this;
    }

    public addImage(imageOrBuffer: Image | Buffer, ...args: [number, number, number?, number?, number?, number?, number?, number?, ImageOptions?]): this {
        const options = args.length % 2 ? args.pop() : {};
        if ((options as ImageOptions)!.restore) this.save();
        if ((options as ImageOptions)!.type) {
            if (Number.isNaN((options as ImageOptions).radius!)) (options as ImageOptions).radius = 10;

            const [dx, dy, width, height] = args;
            if ((options as ImageOptions).type! === 'round') this.createRoundClip(dx + (options as ImageOptions).radius!, dy + (options as ImageOptions).radius!, (options as ImageOptions).radius!);
            else if ((options as ImageOptions).type! === 'bevel') this.createBeveledClip(dx, dy, width!, height!, (options as ImageOptions).radius);
        }
        // @ts-ignore
        this._resolveImage(imageOrBuffer, (image: CanvasImageSource): any => this.context!.drawImage(image, ...args));
        if ((options as ImageOptions).restore) this.restore();
        return this;
    }

    public addRoundImage(imageOrBuffer: Image | Buffer, dx: number, dy: number, dWidth: number, dHeight: number, radius?: number, restore?: boolean | number): this {
        // @ts-ignore
        if (typeof radius === 'boolean') [radius = Math.min(dWidth, dHeight) / 2, restore] = [restore, radius];
        if (typeof restore === 'undefined') restore = true;
        // @ts-ignore
        return this.addImage(imageOrBuffer, dx, dy, dWidth, dHeight, { type: 'round', radius, restore });
    }

    public addCirculatImage(imageOrBuffer: Image | Buffer, dx: number, dy: number, radius: number, restore: boolean = true): this {
        if (restore) this.save();
        const diameter = radius * 2;
        this.createRoundClip(dx, dy, radius);
        this._resolveImage(imageOrBuffer, (image: CanvasImageSource): void => this.context!.drawImage(image, dx - radius, dy - radius, diameter, diameter));
        if (restore) this.restore();
        return this;
    }

    public addBeveledImage(imageOrBuffer: Image | Buffer, dx: number, dy: number, width: number, height: number, radius: number = 10, restore: boolean = true): this {
        // @ts-ignore
        return this.addImage(imageOrBuffer, dx, dy, width, height, { type: 'bevel', radius, restore });
    }

    public addCircle(dx: number, dy: number, radius: number): this {
        return this.save().createRoundPath(dx, dy, radius).fill().restore();
    }

    public addRect(...args: [number, number, number, number]): this {
        this.context!.fillRect(...args);
        return this;
    }

    public addBeveledRect(...args: [number, number, number, number, number?]): this {
        return this.save().createBeveledPath(...args).fill().restore();
    }

    public createRoundPath(dx: number, dy: number, radius: number, start: number = 0, angle: number = Math.PI * 2): this {
        this.context!.beginPath();
        this.context!.arc(dx, dy, radius, start, angle, false);
        return this;
    }

    public createRoundClip(...args: [number, number, number, number?, number?]): this {
        return this.createRoundPath(...args).clip();
    }

    public createRectPath(...args: [number, number, number, number]): this {
        this.context!.rect(...args);
        return this;
    }

    public createRectClip(...args: [number, number, number, number]): this {
        return this.createRectPath(...args).clip();
    }

    public createBeveledPath(dx: number, dy: number, width: number, height: number, radius: any | number): this {
        if (width > 0 && height > 0) {
            let radiusObject: { tl: any; tr: any; br: any; bl: any };
            if (typeof radius === 'number') {
                radius = Math.min(radius, width / 2, height / 2);
                radiusObject = { tl: radius, tr: radius, br: radius, bl: radius };
            } else {
                radiusObject = radius;
                radius = Math.min(5, width / 2, height / 2);
            }
            const { tl = radius, tr = radius, br = radius, bl = radius } = radiusObject;
            this.context!.beginPath();
            this.context!.moveTo(dx + tl, dy);
            this.context!.lineTo(dx + width - tr, dy);
            this.context!.quadraticCurveTo(dx + width, dy, dx + width, dy + tr);
            this.context!.lineTo(dx + width, dy + height - br);
            this.context!.quadraticCurveTo(dx + width, dy + height, dx + width - br, dy + height);
            this.context!.lineTo(dx + bl, dy + height);
            this.context!.quadraticCurveTo(dx, dy + height, dx, dy + height - bl);
            this.context!.lineTo(dx, dy + tl);
            this.context!.quadraticCurveTo(dx, dy, dx + tl, dy);
            this.context!.closePath();
            this.context!.clip();
        }
        return this;
    }

    public createBeveledClip(...args: [number, number, number, number, number?]): this {
        return this.createBeveledPath(...args).clip();
    }

    public setColor(color: string | CanvasGradient): this {
        this.context!.fillStyle = color;
        return this;
    }

    public setTextFont(font: string): this {
        this.context!.font = font;
        return this;
    }

    public setTextAlign(align: 'left' | 'center' | 'right' | 'start' | 'end'): this {
        this.context!.textAlign = align;
        return this;
    }

    public setTextBaseline(baseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'): this {
        this.context!.textBaseline = baseline;
        return this;
    }

    public beginPath(): this {
        this.context!.beginPath();
        return this;
    }

    public closePath(): this {
        this.context!.closePath();
        return this;
    }

    public createPattern(imageOrBuffer: Image | Buffer, reptition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat', callback: Function): this {
        this._resolveImage(imageOrBuffer, (image: CanvasImageSource): any => callback(this.context!.createPattern(image, reptition)));
        return this;
    }

    public printPattern(imageOrBuffer: Image | Buffer, reptition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'): this {
        return this.createPattern(imageOrBuffer, reptition, (pattern: string | CanvasGradient): any => this.setColor(pattern));
    }

    public createLinearGradient(x0: number, y0: number, x1: number, y1: number, steps: any[] = []): CanvasGradient {
        const gradient = this.context!.createLinearGradient(x0, y0, x1, y1);
        for (let i = 0; i < steps.length; i++) {
            gradient.addColorStop(steps[i].position, steps[i].color);
        }
        return gradient;
    }

    public printLinearGradient(...args: [number, number, number, number, any[]]): this {
        const gradient = this.createLinearGradient(...args);
        return this.setColor(gradient);
    }

    public createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, steps: any[] = []): CanvasGradient {
        const gradient = this.context!.createRadialGradient(x0, y0, r0, x1, y1, r1);
        for (let i = 0; i < steps.length; i++) {
            gradient.addColorStop(steps[i].position, steps[i].color);
        }
        return gradient;
    }

    public printRadialGradient(...args: [number, number, number, number, number, number, any[]]): this {
        const gradient = this.createRadialGradient(...args);
        return this.setColor(gradient);
    }

    public createEllipse(dx: number, dy: number, radiusX: number, radiusY: number, rotation = 0, startAngle = 0, endAngle = Math.PI * 2, anticlockwise: boolean): this {
        this.context!.ellipse(dx, dy, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        return this;
    }

    public arc(dx: number, dy: number, radius: number, startAngle = 0, endAngle = Math.PI * 2, anticlockwise = false): this {
        this.context!.arc(dx, dy, radius, startAngle, endAngle, anticlockwise);
        return this;
    }

    public arcTo(...args: [number, number, number, number, number]): this {
        this.context!.arcTo(...args);
        return this;
    }

    public quadraticCurveTo(...args: [number, number, number, number]): this {
        this.context!.quadraticCurveTo(...args);
        return this;
    }

    public bezierCurveTo(...args: [number, number, number, number, number, number]): this {
        this.context!.bezierCurveTo(...args);
        return this;
    }

    public lineTo(...args: [number, number]): this {
        this.context!.lineTo(...args);
        return this;
    }

    public moveTo(...args: [number, number]): this {
        this.context!.moveTo(...args);
        return this;
    }

    public setShadowBlur(radius: number): this {
        this.context!.shadowBlur = radius;
        return this;
    }

    public setShadowColor(color: string): this {
        this.context!.shadowColor = color;
        return this;
    }

    public setShadowOffsetX(value: number): this {
        this.context!.shadowOffsetX = value;
        return this;
    }

    public setShadowOffsetY(value: number): this {
        this.context!.shadowOffsetY = value;
        return this;
    }

    public setMiterLimit(value: number): this {
        this.context!.miterLimit = value;
        return this;
    }

    public setPatternQuality(pattern: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'): this {
        // @ts-ignore
        this.context!.patternQuality = pattern;
        return this;
    }

    public setTextDrawingMode(mode: 'path' | 'glyph'): this {
        // @ts-ignore
        this.context!.textDrawingMode = mode;
        return this;
    }

    public setAntialiasing(antialias: 'default' | 'none' | 'gray' | 'subpixel'): this {
        // @ts-ignore
        this.context!.antialias = antialias;
        return this;
    }

    public setGlobalCompositionOperation(type: 'source-over' | 'source-in' | 'source-out' | 'source-atop' | 'destination-over' | 'destination-in' | 'destination-out' | 'destination-atop' | 'lighter' | 'copy' | 'xor' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity' | 'multiply' | 'screen' | 'overlay' | 'hard-light' | 'soft-light' | 'hsl-hue' | 'hsl-saturation' | 'hsl-color' | 'hsl-luminosity'): this {
        this.context!.globalCompositeOperation = type;
        return this;
    }

    public setGlobalAlpha(value: number): this {
        this.context!.globalAlpha = value;
        return this;
    }

    public resetShadows(): this {
        return this
            .setShadowBlur(0)
            .setShadowColor('#000000');
    }

    public clearCircle(dx: number, dy: number, radius: number, start = 0, angle = Math.PI * 2): this {
        return this
            .createRoundClip(dx, dy, radius, start, angle)
            .clearPixels(dx - radius, dy - radius, radius * 2, radius * 2);
    }

    public clearPixels(dx = 0, dy = 0, width = this.width, height = this.height): this {
        this.context!.clearRect(dx, dy, width, height);
        return this;
    }

    public getLineDash(): number[] {
        return this.context!.getLineDash();
    }

    public get lineDash(): number[] {
        return this.getLineDash();
    }

    public isPointInPath(...args: [number, number, fillRule]): boolean {
        return this.context!.isPointInPath(...args);
    }

    public isPointInStroke(...args: [number, number]): boolean {
        return this.context!.isPointInStroke(...args);
    }

    public process(fn: Function, ...args: any[]): this {
        fn.call(this, this, ...args);
        return this;
    }

    public addTextFont(path: string, family: string): this {
        // @ts-ignore
        if (typeof this.context!.addFont === 'function') this.context!.addFont(new InternalCanvas.Font(family, path));
        else Canvas.registerFont(path, family);
        return this;
    }

    public toBuffer(...args: any[]): Buffer {
        // @ts-ignore
        return this.canvas.toBuffer(...args);
    }

    public toBufferAsync(): Promise<Buffer> {
        // @ts-ignore
        return new Promise((resolve, reject): void => this.canvas.toBuffer((err: any, res: Buffer | PromiseLike<Buffer> | undefined): void => {
            if (err) reject(err);
            else resolve(res);
        }));
    }

    public toDataURL(...args: [string, any[]]): string {
        return this.canvas.toDataURL(...args);
    }

    public toDataURLAsync(type: string): Promise<string> {
        // @ts-ignore
        return new Promise((resolve, reject): void => this.canvas.toDataURL(type, (err, url): any => {
            if (err) reject(err);
            else resolve(url);
        }));
    }

    public toBlob(...args: [BlobCallback, string?, number?]): void {
        return this.canvas.toBlob(...args);
    }

    public toBlobAsync(...args: [string?, number?]): Promise<Blob> {
        return new Promise((resolve): void => this.canvas.toBlob(resolve as BlobCallback, ...args));
    }

    public wrapText(text: string, wrapWidth: number, callback: Function): this | string {
        const wrappedText = textWrap(this, text, wrapWidth);
        if (callback) {
            if (typeof callback !== 'function') throw new TypeError('Callback must be a function');
            callback.call(this, wrappedText, this);
            return this;
        }
        return wrappedText;
    }

    private _resolveImage(imageOrBuffer: Image | Buffer, cb: Function): Image {
        if (imageOrBuffer instanceof InternalCanvas.Image) {
            cb(imageOrBuffer);
            return imageOrBuffer as Image;
        }

        const image: Image = new InternalCanvas.Image();
        image.onload = cb.bind(this, image);
        image.src = imageOrBuffer as Buffer;

        return image;
    }

    public static from(canvas: HTMLCanvasElement): void {
        const instance = new Canvas();
        instance.canvas = canvas;
        instance.context = canvas.getContext('2d');
    }

    public static get internalCanvas(): any {
        return InternalCanvas;
    }

    public static registerFont(path: string, family: string): typeof Canvas {
        if (typeof InternalCanvas.registerFont !== 'function') {
            throw new Error('registerFont is not supported in this version of node-canvas, please install node-canvas 2.x');
        }
        if (!family) {
            throw new TypeError('A family must be specified for registerFont');
        }

        InternalCanvas.registerFont(path, family.constructor === Object ? family : { family });
        return Canvas;
    }
}