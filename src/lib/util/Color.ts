export interface ColorHandler {
    readonly b10: B10;
    readonly hex: HEX;
    readonly hsl: HSL;
    readonly rgb: RGB;
    check(): void;
    toString(): string;
}

export class B10 implements ColorHandler {
    public value: number;

    public constructor(value: string | number) {
        this.value = Number(value);
        this.check();
    }

    public get b10(): B10 {
        return this;
    }

    public get hex(): HEX {
        const hex = this.value.toString(16).padStart(6, '0');
        return new HEX(hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6));
    }

    public check(): void {
        if (this.value < 0 || this.value > 0xFFFFFF) throw 'Color must be within the range 0 - 16777215 (0xFFFFFF).';
    }

    public toString(): string {
        return String(this.value);
    }
}

export class HEX implements ColorHandler {
    public r: string;
    public g: string;
    public b: string;

    public constructor(r: string, g: string, b: string) {
        this.r = r.padStart(2, '0');
        this.g = g.padStart(2, '0');
        this.b = b.padStart(2, '0');

        this.check();
    }

    public get b10(): B10 {
        return new B10(Number.parseInt(this.r + this.g + this.b, 16));
    }

    public get hex(): HEX {
        return this;
    }

    public check(): void {
        if (Number.isNaN(parseInt(this.r, 16))) throw `Invalid Red range. Must be between '00' and 'ff', and it is '${this.r}'`;
        if (Number.isNaN(parseInt(this.g, 16))) throw `Invalid Green range. Must be between '00' and 'ff', and it is '${this.g}'`;
        if (Number.isNaN(parseInt(this.b, 16))) throw `Invalid Blue range. Must be between '00' and 'ff', and it is '${this.b}'`;
    }

    public toString(): string {
        return String(`#${this.r}${this.g}${this.b}`);
    }
}

export class HSL implements ColorHandler {
    public h: number;
    public s: number;
    public l: number;

    public constructor(h: number | string, s: number | string, l: number | string) {
        this.h = Number(h);
        this.s = Number(s);
        this.l = Number(l);

        this.check();
    }

    public check(): void {
        if (this.h < 0 || this.h > 360) throw `Invalid Hue range. Must be between 0 and 360, and it is ${this.h}`;
        if (this.s < 0 || this.s > 100) throw `Invalid Saturation range. Must be between 0 and 100, and it is ${this.s}`;
        if (this.l < 0 || this.l > 100) throw `Invalid Lightness range. Must be between 0 and 100, and it is ${this.l}`;
    }

    public toString(): string {
        return String(`hsl(${this.h}, ${this.s}, ${this.l})`);
    }

    public static hue2rgb(p: number, q: number, t: number): number {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (((q - p) * 6) * t);
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (((q - p) * ((2 / 3) - t)) * 6);
        return p;
    }
}

export class RGB implements ColorHandler {
    public r: number;
    public g: number;
    public b: number;

    public constructor(r: number | string, g: number | string, b: number | string) {
        this.r = Number(r);
        this.g = Number(g);
        this.b = Number(b);

        this.check();
    }

    public check(): void {
        if (this.r < 0 || this.r > 255) throw `Invalid Red range. Must be between 0 and 255, and it is ${this.r}`;
        if (this.g < 0 || this.g > 255) throw `Invalid Green range. Must be between 0 and 255, and it is ${this.g}`;
        if (this.b < 0 || this.b > 255) throw `Invalid Blue range. Must be between 0 and 255, and it is ${this.b}`;
    }

    public toString(): string {
        return String(`rgb(${this.r}, ${this.g}, ${this.b})`);
    }
}