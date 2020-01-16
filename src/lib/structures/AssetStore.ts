import { KlasaClient, Store } from 'klasa';
import { Asset } from './Asset';
import { scan } from 'fs-nextra';
import { extname } from 'path';
import { noop } from '../util/Utils';
import { Events } from '../types/Enums';

export class AssetStore extends Store<string, Asset, typeof Asset> {

	public constructor(client: KlasaClient, coreDir: string) {
		super(client, 'assets', Asset);

		this.registerCoreDirectory(coreDir);
	}

	private get filepaths(): string[] {
		return this.map((asset): string => asset.filepath);
	}

	public async init(): Promise<any[]> {
		const { filepaths } = this;

		const files = await scan(Asset.basePath, {
			filter: (stats, path): boolean => stats.isFile() && ['webp', 'png', 'jpg', 'gif'].includes(extname(path))
		})
			.then((f): string[] => [...f.keys()].filter((path): boolean => !filepaths.includes(path)))
			.catch(noop);

		if (!files) throw new Error('Assets folder not found.');

		if (files.length) {
			for (const file of files) this.client.emit(Events.Warn, `No Asset found for ${file}.`);
		}

		return super.init();
	}
}
