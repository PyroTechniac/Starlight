import { ensureDir, targz } from 'fs-nextra';
import { Provider, Task, TaskStore, Timestamp } from 'klasa';
import { dirname, resolve } from 'path';

export default class extends Task {
    private timestamp: Timestamp = new Timestamp('YYYY-MM-DD[T]HHmmss');
    public constructor(store: TaskStore, file: string[], directory: string) {
        super(store, file, directory);
    }

    private get provider(): Provider {
        return this.client.providers.get('json')!;
    }

    public async run(data: {folder: string} = { folder: './' }): Promise<void> {
        if (!('folder' in data)) data = { folder: './' };
        const file = resolve(data.folder, `json-backup-${this.timestamp}.tar.gz`);

        await ensureDir(dirname(file));
        // @ts-ignore
        await targz(file, this.provider.baseDirectory);
    }
}