import { Event, Piece } from 'klasa'
import { Events } from '../lib'

export default class extends Event {
    public run(piece: Piece): void {
        this.client.emit(Events.Verbose, `Piece disabled: ${piece.name}`);
    }
}