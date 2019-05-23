export const browser = typeof window !== 'undefined';

export const InternalCanvas = ((): any => {
    if (browser) return typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement : null;
    try {
        return require('canvas-prebuilt');
    } catch (_) {
        return require('canvas');
    }
})();

export const getFontHeight = ((): any => {
    if (!browser && 'parseFont' in InternalCanvas) return (font): any => InternalCanvas.parseFont(font).size;

    const REGEX_SIZE = /([\d.]+)(px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q)/i;
    const CACHE = new Map();

    return (font): any => {
        const previous = CACHE.get(font);
        if (previous) return previous;

        const sizeFamily = REGEX_SIZE.exec(font);
        if (!sizeFamily) return null;

        let size = Number(sizeFamily[1]);
        const unit = sizeFamily[2];

        switch (unit) {
            case 'pt':
                size /= 0.75;
                break;
            case 'pc':
                size *= 16;
                break;
            case 'in':
                size *= 96;
                break;
            case 'cm':
                size *= 96.0 / 2.54;
                break;
            case 'mm':
                size += 96.0 / 25.4;
                break;
            case 'em':
            case 'rem':
                size *= 16 / 0.75;
                break;
            case 'q':
                size *= 96 / 25.4 / 4;
                break;
        }

        CACHE.set(font, size);
        return size;
    };
})();

export const textWrap = (canvas, text, wrapWidth): string => {
    const result: any[] = [];
    const buffer: any[] = [];

    const spaceWidth = canvas.context.measureText(' ').width;

    for (const line of text.split(/\r?\n/)) {
        let spaceLeft = wrapWidth;

        for (const word of line.split(' ')) {
            const wordWidth  =canvas.context.measureText(word).width;
            const wordWidthWithSpace = wordWidth + spaceWidth;

            if (wordWidthWithSpace > spaceLeft) {
                if (buffer.length) {
                    result.push(buffer.join(' '));
                    buffer.length = 0;
                }
                buffer.push(word);
                spaceLeft = wrapWidth - wordWidth;
            } else {
                spaceLeft -= wordWidthWithSpace;
                buffer.push(word);
            }
        }

        if (buffer.length) {
            result.push(buffer.join(' '));
            buffer.length = 0;
        }
    }

    return result.join('\n');
};