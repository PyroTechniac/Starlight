import { StarlightCommand } from './StarlightCommand';

export abstract class GeneratorCommand extends StarlightCommand {
	public async *args(): AsyncGenerator<ArgumentOptions> {

	}
}

export interface ArgumentOptions {
	type?: string;
}