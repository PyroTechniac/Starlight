import { Piece } from 'klasa';

export abstract class NodeMonitor extends Piece {

	public abstract run(message: unknown): unknown;

}
