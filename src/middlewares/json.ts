import { KlasaIncomingMessage, Middleware, MiddlewareOptions } from 'klasa-dashboard-hooks';
import { createGunzip, createInflate } from 'zlib';
import { ApplyOptions } from '../lib/util/Decorators';

@ApplyOptions<MiddlewareOptions>({
    priority: 20
})
export default class extends Middleware {

	public async run(request: KlasaIncomingMessage): Promise<void> {
		if (request.method !== 'POST') return;

		const stream = this.contentStream(request);
		let body = '';

		for await (const chunk of stream) body += chunk;

		const data = JSON.parse(body);
		request.body = data;
	}

	public contentStream(request: KlasaIncomingMessage): any {
		const length = request.headers['content-length'];
		let stream;
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
				stream.length = length;
		}
		return stream;
	}
}