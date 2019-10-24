import { Structures } from 'discord.js';
import { BankAccount } from '../structures/BankAccount';

export class StarlightUser extends Structures.get('User') {

	public account = new BankAccount(this);

}
