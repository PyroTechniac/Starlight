const Messages: Map<string, string | Function> = new Map([
    ['INVALID_ARG', (expected: string, arg: string, received: string): string => `Argument type ${arg} expected ${expected}, but got ${received}`]
]);

export class StarlightError extends Error {
    private code: string;
    public constructor(message: string, ...args: string[]) {
        const errorMessage = Messages.get(message);
        if (errorMessage === null) throw new TypeError(`Error key ${message} does not exist`);
        const msg = typeof errorMessage === 'function' ? errorMessage(...args) : errorMessage;

        super(msg);

        this.code = message;
    }

    public get name(): string {
        return `StarlightError [${this.code}]`;
    }
}