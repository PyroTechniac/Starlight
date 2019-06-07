import { Type, util } from 'klasa';
const { isNumber } = util;

export function sanitizeKeyName(value: string): string {
    if (typeof value !== 'string') throw new TypeError(`[SANITIZE_NAME] Expected a string, got: ${new Type(value)}`);
    if (/`|"/.test(value)) throw new TypeError(`Invalid input (${value}).`);
    if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') return value;
    return `"${value}"`;
}

export function parseRange(min: number, max: number): string {
    if (typeof min === 'undefined') return '';
    if (!isNumber(min)) {
        throw new TypeError(`[PARSE_RANGE] 'min' parameter expects an integer or undefined, got ${min}`);
    }

    if (min < 0) {
        throw new RangeError(`[PARSE_RANGE] 'min' parameter expects to be equal or greater than zero, got ${min}`);
    }

    if (typeof max !== 'undefined') {
        if (!isNumber(max)) {
            throw new TypeError(`[PARSE_RANGE] 'max' parameter expects an integer or undefined, got ${max}`);
        }
        if (max <= min) {
            throw new RangeError(`[PARSE_RANGE] 'max' parameter expects ${max} to be greater than ${min}. Got: ${max} <= ${min}`);
        }
    }

    return `LIMIT ${min}${typeof max === 'number' ? `,${max}` : ''}`;
}