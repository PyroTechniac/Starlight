import { basename, extname, join, sep } from 'path';
import { KlasaMessage, Piece, Stopwatch, Task } from 'klasa';
import { StarlightCommand } from '../lib/structures/StarlightCommand';
import { Events } from '../lib/types/Enums';
import { watch } from 'chokidar';
import { cast, floatPromise } from '../lib/util/Utils';

const nodeModules = `${sep}node_modules${sep}`;

const fakeMessage = cast<KlasaMessage>({
	sendLocale(): Promise<{}> {
		return Promise.resolve({});
	},
	sendMessage(): Promise<{}> {
		return Promise.resolve({});
	}
});

interface Reload extends StarlightCommand {
	everything(message: KlasaMessage): Promise<unknown>;
}

interface Run {
	name: string;
	store: string | null;
	piece: Piece | null;
}

export default class extends Task {

	private running = false;

	public async run({ name, store, piece }: Run): Promise<void> {
		const timer = new Stopwatch();

		for (const module of Object.keys(require.cache)) {
			if (!module.includes(nodeModules) && extname(module) !== '.node') {
				delete require.cache[module];
			}
		}

		let log: string;
		const reload = this.client.commands.get('reload') as Reload;
		if (piece === null) {
			await reload.everything(fakeMessage);
			log = `Reloaded everything in ${timer.stop()}`;
		} else {
			await reload.run(fakeMessage, [piece]);
			log = `Reloaded it in ${timer.stop()}`;
		}

		this.client.emit(Events.Verbose, `[${store}] ${name} was updated. ${log}`);
	}

	public init(): Promise<void> {
		if (!this.client.options.watchFiles) return Promise.resolve(this.unload());

		if (this.client.fsWatcher !== null) return Promise.resolve();

		this.client.fsWatcher = watch(join(process.cwd(), 'dist'), {
			ignored: [
				'**/tsconfig.tsbuildinfo',
				'**/bwd/provider/**'
			],
			persistent: true,
			ignoreInitial: true,
			cwd: process.cwd()
		});

		const reloadStore = async (path: string): Promise<void> => {
			const name = basename(path);
			const store = path.split(sep).find((dir): boolean => this.client.pieceStores.has(dir)) ?? null;
			const piece = store ? this.client.pieceStores.get(store).get(name.replace(extname(name), '')) ?? null : null;

			if (!piece) {
				if (this.running) return;
				this.running = true;
				await this.run({ name, store, piece });
				this.running = false;
				return;
			}

			floatPromise(this, this.run({ name, store, piece })); // eslint-disable-line @typescript-eslint/no-floating-promises
		};

		for (const event of ['add', 'change', 'unlink']) {
			this.client.fsWatcher.on(event, reloadStore);
		}

		return Promise.resolve();
	}

}
