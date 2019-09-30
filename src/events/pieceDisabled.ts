import { Events } from '@typings/Enums';
import { Event, Piece } from 'klasa';

export default class extends Event {

	public run(piece: Piece): void {
		this.client.emit(Events.Verbose, `Piece disabled: ${piece.name}`);
	}

}
