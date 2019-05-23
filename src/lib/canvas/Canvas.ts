import { browser, getFontHeight, InternalCanvas, textWrap } from './Util';

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

    public rotate(angle: number): this {
        this.context!.rotate(angle);
        return this;
    }

    public scale(dx: number, dy: number): this {
        this.context!.scale(dx, dy);
        return this;
    }

    public translate(dx: number, dy: number): this {
        this.context!.scale(dx, dy);
        return this;
    }

    public clip(path?: any, fillRule?: 'nonzero' | 'evenodd'): this {
        this.context!.clip(path, fillRule);
        return this;
    }

    public setTransform(...args: [number, number, number, number, number, number]): this {
        this.context!.setTransform(...args);
        return this;
    }
}