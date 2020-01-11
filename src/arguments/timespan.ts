import { Argument, Duration, KlasaMessage, Possible } from 'klasa';
import { isNumber } from '@klasa/utils';

export default class extends Argument {

	public run(arg: string, possible: Possible, message: KlasaMessage): number {
		const duration = new Duration(arg);
		if (duration.offset > 0 && isNumber(duration.fromNow.getTime())) return duration.offset;
		throw message.language.get('RESOLVER_INVALID_DURATION', possible.name);
	}

}
