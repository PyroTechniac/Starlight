import { ensureDir, targz } from 'fs-nextra';
import { Provider, Task, Timestamp } from 'klasa';
import { dirname, resolve } from 'path';
import { BackupData } from '../lib';

export default class extends Task {
    private timestamp: Timestamp = new Timestamp('YYYY-MM-DD[T]HHmmss');

    private get provider(): Provider {
        return this.client.providers.get('json')!;
    }

    public async run(data: BackupData = { folder: './' }): Promise<void> {
        if (!('folder' in data)) data = { folder: './' };

        const file = resolve(data.folder!, `json-backup-${this.timestamp}.tar.gz`);

        await ensureDir(dirname(file));
        // @ts-ignore because provider typings don't have a `baseDirectory` prop
        await targz(file, this.provider.baseDirectory);
    }
}