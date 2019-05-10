import { ClientUtil } from './StarlightUtil';
import { KlasaClient } from 'klasa';

export type tagFunction = (subStrings: TemplateStringsArray, ...params: any[]) => string;

// eslint-disable-next-line
type format = typeof MarkdownUtil.prototype.bold | typeof MarkdownUtil.prototype.code | typeof MarkdownUtil.prototype.codeBlock | typeof MarkdownUtil.prototype.italic | typeof MarkdownUtil.prototype.spoiler | typeof MarkdownUtil.prototype.strikethrough | typeof MarkdownUtil.prototype.underline

export class MarkdownUtil {
    public client: KlasaClient
    public constructor(public util: ClientUtil) {
        this.client = util.client;
    }

    public bold(subStrings: TemplateStringsArray, ...args: any[]): string {
        return `**${MarkdownUtil.constructTemplate(subStrings, ...args)}**`;
    }

    public code(subStrings: TemplateStringsArray, ...args: any[]): string {
        return `\`${MarkdownUtil.constructTemplate(subStrings, ...args)}\``;
    }

    public codeBlock(type: string): tagFunction;
    public codeBlock(type: TemplateStringsArray, ...args: any[]): string;
    public codeBlock(type: string | TemplateStringsArray, ...args: any[]): string | tagFunction {
        if (Array.isArray(type)) return `\`\`\`\n${MarkdownUtil.constructTemplate(type as TemplateStringsArray, ...args)}\`\`\``;
        return (subStrings: TemplateStringsArray, ...params: any[]): string => `\`\`\`${type}\n${MarkdownUtil.constructTemplate(subStrings, ...params)}\`\`\``;
    }

    public italic(subStrings: TemplateStringsArray, ...args: any[]): string {
        return `*${MarkdownUtil.constructTemplate(subStrings, ...args)}*`;
    }

    public nest(...formats: format[]): tagFunction {
        return (subStrings: TemplateStringsArray, ...values: any[]): string => {
            let text = MarkdownUtil.constructTemplate(subStrings, ...values);
            for (const format of formats) text = format`${text}`;
            return text;
        };
    }

    public spoiler(subStrings: TemplateStringsArray, ...args: any[]): string {
        return `||${MarkdownUtil.constructTemplate(subStrings, ...args)}||`;
    }

    public strikethrough(subStrings: TemplateStringsArray, ...args: any[]): string {
        return `~~${MarkdownUtil.constructTemplate(subStrings, ...args)}~~`;
    }

    public underline(subStrings: TemplateStringsArray, ...args: any[]): string {
        return `__${MarkdownUtil.constructTemplate(subStrings, ...args)}__`;
    }

    private static constructTemplate(subStrings: TemplateStringsArray, ...values: any[]): string {
        return values.reduce((prev, cur, i): string => `${prev}${cur}${subStrings[i + 1]}`, subStrings[0]);
    }
}