import { Client, Command, CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';

const suffixes: string[] = ['Bytes', 'KB', 'MB'];
const getBytes = (bytes: number): string => {
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (!bytes && '0 Bytes') || `${(bytes / Math.pow(1024, i)).toFixed(2)} ${suffixes[i]}`;
};

export default class CrateCommand extends Command {
    public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            description: 'Shows the publish/install size of a cargo crate',
            usage: '<name:string>'
        });
    }

    public async run(msg: KlasaMessage, [name]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { crate, version: [latest] } = await fetch(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`)
            .then((res): any => res.json())
            .catch((): never => {
                throw 'There was an unexpected error, please try again';
            });

        if (!crate) throw 'That crate doesn\'t exist';

        const embed = this.client.util.embed()
            .setColor(15051318)
            .setThumbnail('https://doc.rust-lang.org/cargo/images/Cargo-Logo-Small.png')
            .setTitle(name)
            .setURL(`https://crates.io/crates/${name}`)
            .setDescription(`${crate.description}
			[Documentation](${crate.documentation}) - [Repository](${crate.repository})
						`)
            .addField('Total Downloads', crate.downloads.toLocaleString(), true)
            .addField('Categories', crate.categories.join(', '), true)
            .addField('Keywords', crate.keywords.join(', '), true)
            .addField('Latest Version', `
			**Number:** ${latest.num}
			**Size:** ${getBytes(latest.crate_size)}
			**Downloads:** ${latest.downloads.toLocaleString()}
			**License:** ${latest.license}
			`, true);

        return msg.sendEmbed(embed);
    }
}