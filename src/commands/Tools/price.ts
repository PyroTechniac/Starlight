import { Command, CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';

export default class PriceCommand extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            description: 'Compares the values of a currency (crypto, flat) with another',
            usage: '<coin:str{1,3}> <currency:str{1,3}> [amount:int{1}]',
            usageDelim: ' '
        });
    }

    public async run(msg: KlasaMessage, [coin, currency, amount = 1]: [string, string, number]): Promise<KlasaMessage | KlasaMessage[]> {
        const c1 = coin.toUpperCase();
        const c2 = currency.toUpperCase();


        const body = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${c1}&tsyms=${c2}`)
            .then((response): any => response.json())
            .catch((): never => { throw 'There was an error, please make sure you specified an appropriate coin and currency.'; });
        if (!body[c2]) return msg.sendMessage('There was an error, please make sure you specified an appropriate coin and currency');
        return msg.sendMessage(`Current price of ${amount} ${c1} is ${(body[c2] * amount).toLocaleString()} ${c2}`);
    }
}