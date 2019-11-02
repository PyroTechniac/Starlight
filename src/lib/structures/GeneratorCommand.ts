import { StarlightCommand } from './StarlightCommand';

export abstract class GeneratorCommand extends StarlightCommand {

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public async *args(): AsyncGenerator<ArgumentOptions> {

	}

}

export interface ArgumentOptions {
	type?: string;
}
