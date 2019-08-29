export function getLineAndColumn(code: string, start: number): { line: number; column: number } {
	let line = 1;
	let column = 0;
	let scanned = 0;
	let next = 0;
	for (const codeLine of code.split('\n')) {
		next = scanned + codeLine.length;
		if (next >= start) {
			column = start - scanned;
			break;
		}
		scanned = next + 1;
		line++;
	}

	return { line, column };
}

export class CompilationParseError extends Error {

	public constructor(code: string, start: number, message: string = 'Unknown Error') {
		const position = getLineAndColumn(code, start);
		super(`${message} (at ${position.line}:${position.column}).`);
	}

}

export class MethodParseError extends CompilationParseError { }

export class UnknownIdentifier extends CompilationParseError {

	public constructor(code: string, start: number, name: string) {
		super(code, start, `The indentifier \`${name}\` is not defined`);
	}

}

export class AlreadyDeclaredIdentifier extends CompilationParseError {

	public constructor(code: string, start: number, name: string) {
		super(code, start, `The identifier \`${name}\` was already been declared`);
	}

}

export class SandboxError extends CompilationParseError { }

export class SandboxPropertyError extends CompilationParseError {

	public constructor(code: string, start: number, name: string) {
		super(code, start, `The property access to \`${name}\` is forbidden`);
	}

}

export class MissingPropertyError extends CompilationParseError {

	public constructor(code: string, start: number, name: string) {
		super(code, start, `The property \`${name}\` does not exist`);
	}

}
