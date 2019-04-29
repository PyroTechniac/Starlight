const Messages = {
    PREFIX_LENGTH: (expected: number, actual: number): string => `Expected a prefix length between ${expected}, got ${actual}`,
    INVALID_TOKEN: (token: string): string => `The token '${token}' is invalid`
};

export class StarlightError extends Error {
    private code: string;
    public constructor(key: string, ...args: any[]) {
        if (Messages[key] == null) throw new TypeError(`Error key '${key}' does not exist`); // eslint-disable-line no-eq-null
        const message: string = typeof Messages[key] === 'function' ? Messages[key](...args) : Messages[key];
        super(message);

        this.code = key;
    }

    public get name(): string {
        return `StarlightError [${this.code}]`;
    }
}
