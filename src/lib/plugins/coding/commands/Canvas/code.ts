import { Canvas } from 'canvas-constructor';
import { Command as KlasaCommand, CommandStore, KlasaMessage, Stopwatch, util as KlasaUtil } from 'klasa';
import { ScriptTarget, transpileModule, TranspileOptions } from 'typescript';
import { inspect } from 'util';
import { evaluate } from '../../lib/util/evaluator';

const tsTranspileOptions: TranspileOptions = { compilerOptions: { allowJs: true, checkJs: true, target: ScriptTarget.ESNext } };

const CODEBLOCK = /^```(?:js|javascript)?([\s\S]+)```$/;

export default class extends KlasaCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 1,
			cooldown: 5,
			description: 'Executes a sandboxed subset of JavaScript',
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<code:string>'
		});
	}

	public async run(message: KlasaMessage, [code]: [string]): Promise<KlasaMessage |KlasaMessage[]> {
		code = this.parseCodeBlock(code);
		const sw = new Stopwatch(5);
		try {
			let output = await evaluate(message.flags.ts ? transpileModule(code, tsTranspileOptions).outputText : code);
			sw.stop();
			if (output instanceof Canvas) output = await output.toBufferAsync();
			// @ts-ignore
			if (output instanceof Buffer) return message.channel.sendFile(output, 'output.png', `\`✔\` \`⏱ ${sw}\``);
			// @ts-ignore
			return message.send(`\`✔\` \`⏱ ${sw}\`\n${KlasaUtil.codeBlock('js', inspect(output, false, 0, false))}`);
		} catch (error) {
			if (sw.running) sw.stop();
			throw `\`❌\` \`⏱ ${sw}\`\n${KlasaUtil.codeBlock('', 'stack' in message.flags && this.client.owners.has(message.author!) ? error.stack : error)}`;
		}
	}

	public parseCodeBlock(code: string): string {
		return CODEBLOCK.test(code) ? CODEBLOCK.exec(code)![1].trim() : code;
	}

}
