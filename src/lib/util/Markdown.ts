/**
 * @license
 * MIT License
 *
 * Copyright (c) 2017-2019 dirigeants
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * @url https://github.com/bsdistin/discord-md-tags
 */

export function bold(subStrings: TemplateStringsArray, ...args: any[]): string {
	return `**${constructTemplate(subStrings, ...args)}**`;
}

export function code(subStrings: TemplateStringsArray, ...args: any[]): string {
	return `\`${constructTemplate(subStrings, ...args)}\``;
}

export function codeblock(type: string): TagFunction;
export function codeblock(type: TemplateStringsArray, ...args: any[]): string;
export function codeblock(type: string | TemplateStringsArray, ...args: any[]): string | TagFunction {
	if (typeof type === 'string') return (subStrings: TemplateStringsArray, ...args: any[]): string => `\`\`\`${type}${constructTemplate(subStrings, ...args)}\`\`\``;
	return `\`\`\`${constructTemplate(type, ...args)}\`\`\``;
}

export function italic(subStrings: TemplateStringsArray, ...args: any[]): string {
	return `*${constructTemplate(subStrings, ...args)}*`;
}

export function spoiler(subStrings: TemplateStringsArray, ...args: any[]): string {
	return `||${constructTemplate(subStrings, ...args)}||`;
}

export function strikethrough(subStrings: TemplateStringsArray, ...args: any[]): string {
	return `~~${constructTemplate(subStrings, ...args)}~~`;
}

export function underline(subStrings: TemplateStringsArray, ...args: any[]): string {
	return `__${constructTemplate(subStrings, ...args)}__`;
}

type Format =
	typeof bold
	| typeof code
	| typeof codeblock
	| typeof italic
	| typeof spoiler
	| typeof strikethrough
	| typeof underline;

export function compose(...formats: Format[]): TagFunction {
	return (subStrings: TemplateStringsArray, ...values: any[]): string => {
		let text = constructTemplate(subStrings, ...values);
		for (const format of formats) text = format`${text}`;
		return text;
	};
}

function constructTemplate(subStrings: TemplateStringsArray, ...values: any[]): string {
	return values.reduce((prev, cur, i): string => `${prev}${cur}${subStrings[i + 1]}`, subStrings[0]);
}

interface TagFunction {
	(subStrings: TemplateStringsArray, ...params: any[]): string;
}
