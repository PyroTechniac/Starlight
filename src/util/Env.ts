import { resolve } from 'path';
import { readFileSync } from 'fs';

const NEWLINE = '\n';
const RE_INI_KEY_VAL: RegExp = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const RE_NEWLINES: RegExp = /\\n/g;

export interface DotenvParseOutput { [key: string]: string }

export interface DotenvParseOptions {
    debug?: boolean;
}

export interface DotenvConfigOutput {
    parsed?: DotenvParseOutput;
    error?: Error;
}

export interface DotenvConfigOptions {
    path?: string;
    encoding?: string;
    debug?: string;
}

const log = (message: string): void => {
    console.log(`[ENV][DEBUG] ${message}`); // eslint-disable-line no-console
};

export const parse = (src: string | Buffer, options?: DotenvParseOptions): DotenvParseOutput => {
    const debug = Boolean(options && options.debug);
    const obj: Record<string, string> = {};

    src.toString().split(NEWLINE).forEach((line, idx): void => {
        const keyValueArr = line.match(RE_INI_KEY_VAL);

		if (keyValueArr != null) { // eslint-disable-line
            const key = keyValueArr[1];
            let val = (keyValueArr[2] || '');
            const end = val.length - 1;
            const isDoubleQuoted = val[0] === '"' && val[end] === '"';
            const isSingleQuoted = val[0] === '\'' && val[end] === '\'';

            if (isSingleQuoted || isDoubleQuoted) {
                val = val.substring(1, end);
                if (isDoubleQuoted) {
                    val = val.replace(RE_NEWLINES, NEWLINE);
                }
            } else {
                val = val.trim();
            }

            obj[key] = val;
        } else if (debug) {
            log(`Did not match key and value when parsing line ${idx - 1}: ${line}`);
        }
    });
    return obj;
};

export const config = (options?: DotenvConfigOptions): DotenvConfigOutput => {
    let dotenvPath = resolve(process.cwd(), '.env');
    let encoding = 'utf8';
    let debug = false;

    if (options) {
		if (options.path != null) { // eslint-disable-line
            dotenvPath = options.path;
        }
		if (options.encoding != null) { // eslint-disable-line
            encoding = options.encoding;
        }
		if (options.debug != null) { // eslint-disable-line
            debug = !!options.debug;
        }
    }

    try {
        const parsed = parse(readFileSync(dotenvPath, { encoding }), { debug });
        Object.keys(parsed).forEach((key): void => {
            if (!process.env.hasOwnProperty(key)) {
                process.env[key] = parsed[key];
            } else if (debug) {
                log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
            }
        });
        return { parsed };
    } catch (e) {
        return { error: e };
    }
};