import { ConsoleColorStyles } from './ConsoleColorStyles';

export interface ConsoleOptions {
    utc?: boolean;
    colors?: ConsoleColorStyles;
    stderr?: NodeJS.WritableStream;
    stdout?: NodeJS.WritableStream;
    timestamps?: boolean | string;
    useColor?: boolean;
}