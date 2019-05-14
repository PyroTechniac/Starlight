import * as PromiseQueue from 'promise-queue';
import { EventEmitter } from 'events';
import * as childprocess from 'child_process';

const regExp = {
    terminalMessages: [
        /ready\s+to\s+accept/im,
        /can't\s+set\s+maximum\s+open\s+files\s+to\s+\d+\s+because\s+of\s+OS\s+error/im,
        /already\s+in\s+use|not\s+listen|error|denied|can't/im
    ],
    errorMessage: /#\s+(.*error|can't.*)/im,
    comma: /,/g,
    digit: /\d+/g,
    quoteMark: /'/g,
    whiteSpace: /\s/g,
    multipleWhiteSpace: /\s\s+/g
};

export interface RedisServerConfig {
    bin?: string;
    conf?: string;
    port?: number | string;
    slaveof?: string;
}

export class RedisServer extends EventEmitter {
    public static parseConfig(source: RedisServerConfig, target: RedisServerConfig): RedisServerConfig {
        if (target == null) { // eslint-disable-line
            target = Object.create(null);
        }

        if (typeof source === 'number' || typeof source === 'string') {
            target.port = source;

            return target;
        }

        if (source == null || typeof source !== 'object') {
            return target;
        }

        if (source.bin != null) {
            target.bin = source.bin;
        }
        if (source.conf != null) {
            target.conf = source.conf;

            return target;
        }

        if (source.slaveof != null) {
            target.slaveof = source.slaveof;
        }
        if (source.port != null) {
            target.port = source.port;
        }

        return target;
    }

    public static parseFlags(config: RedisServerConfig): string[] {
        if (config.conf != null) {
            return [config.conf];
        }

        const flags: string[] = [];
        if (config.port != null) {
            flags.push(`--port ${config.port}`)
        }

        if (config.slaveof != null) {
            flags.push(`--slaveof ${config.slaveof}`)
        }

        return flags;
    }

    public static parseData(str: string): Record<any, any> | null {
        const matches = regExp.terminalMessages
            .map((re): RegExpExecArray | null => re.exec(str))
            .find((m): boolean => m !== null)

        if (matches == null) {
            return null;
        }

        const match = matches.pop();
        const result = {
            err: null,
            key: match!
                .replace(regExp.whiteSpace, '')
                .replace(regExp.quoteMark, '')
                .replace(regExp.comma, '')
                .replace(regExp.digit, '')
                .toLowerCase()
        }

        switch (result.key) {
            case 'readytoaccept':
                break;
            case 'alreadyinuse':
                // @ts-ignore
                result.err = new Error('Address already in use')
                // @ts-ignore
                result.err.code = -1

                break;
            case 'denied':
                // @ts-ignore
                result.err = new Error('Permission denied')
                // @ts-ignore
                result.err.code = -2;

                break
            case 'notlisten':
                // @ts-ignore
                result.err = new Error('Invalid port number')
                // @ts-ignore
                result.err.code = -3;

                break;
            case 'cant':
            case 'error':
                // @ts-ignore
                result.err = new Error(
                    regExp.errorMessage
                        .exec(str)!
                        .pop()!
                        .replace(regExp.multipleWhiteSpace, '')
                )
                // @ts-ignore
                result.err.code = -3

                break;
            case 'cantsetmaximumopenfilestobecauseofoserror':
                return this.parseData(str.replace(match!, ''))
        }

        return result;
    }
}