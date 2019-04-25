interface JSTag {
	display(): unknown;
	parse(element?: unknown): this;
}

class Util {
	static isObjectLiteral(obj: any): boolean {
		return obj ? obj.constructor === Object : false;
	}

	static parseElement(element: any) {
		if (element == null) return null;
		if (Array.isArray(element)) return new ArrayTag().parse(element);
	}
}

export class ArrayTag extends Array<JSTag> implements JSTag {
	public display(): this {
		return this;
	}

	public parse(element: unknown[]): this {
		for (const value of element) this.push(Util.parseElement(value));
		return this;
	}

	public get(index: 'random' | number): JSTag | null {
		if (index === 'random') return this.random();
		const value = this[index];
		return value == null ? null : value;
	}

	public first(): JSTag | null {
		return this.length ? this[0] : null;
	}

	public last(): JSTag | null {
		return this.length ? this[this.length - 1] : null;
	}

	public random(): JSTag | null {
		return this.length ? this[Math.floor(Math.random() * this.length)] : null;
	}
}

export class BlockTag extends Map<string, JSTag> implements JSTag {
	public display(): this {
		return this;
	}

	public parse(element: Record<string, unknown>): this {
		for (const key of Object.keys(element)){
			this.set(key, Util.parseElement(element[key]));
		}
		return this;
	}
}