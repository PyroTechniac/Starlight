import { Middleware, MiddlewareOptions, KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { createGunzip, createInflate, Gunzip, Inflate } from 'zlib';
import { ApplyOptions } from '../lib/util/Decorators';

@ApplyOptions<MiddlewareOptions>({
	priority: 20
})
export default class extends Middleware {

	public async run(request: KlasaIncomingMessage): Promise<void> {
		if (request.method !== 'POST') return;

		const stream = this.contentStream(request);
		let body = '';

		if (typeof stream === 'undefined') return;
		for await (const chunk of stream) body += chunk;

		request.body = JSON.parse(body);
	}

	private contentStream(request: KlasaIncomingMessage): Inflate | Gunzip | KlasaIncomingMessage | undefined {
		const length = request.headers['content-length'];
		let stream: Inflate | Gunzip | KlasaIncomingMessage | undefined;

		switch ((request.headers['content-encoding'] || 'identity').toLowerCase()) {
			case 'deflate':
				stream = createInflate();
				request.pipe(stream);
				break;
			case 'gzip':
				stream = createGunzip();
				request.pipe(stream);
				break;
			case 'identity':
				stream = request;
				stream.length = Number(length);
		}

		return stream;
	}

}
