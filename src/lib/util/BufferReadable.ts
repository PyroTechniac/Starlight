import { Readable } from 'stream';

export class BufferReadable extends Readable {

	private _source: Buffer | null;
	private _offset: number | null = 0;
	private _length: number | null;
	public constructor(source: Buffer) {
		super();

		if (!Buffer.isBuffer(source)) throw new Error('Source must be a buffer.');

		this._source = source;
		this._length = source.length;

		this.on('end', this._destroySource.bind(this));
	}

	public _read(size: number) {
		if (this._offset! < this._length!) {
			this.push(this._source!.slice(this._offset!, (this._offset! + size)));

			this._offset! += size;
		}

		if (this._offset! >= this._length!) {
			this.push(null);
		}
	}

	private _destroySource() {
		this._source = null;
		this._offset = null;
		this._length = null;
	}

}
