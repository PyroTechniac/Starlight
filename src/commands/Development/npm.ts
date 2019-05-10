import { Command, CommandStore, KlasaClient } from 'klasa';
import * as moment from 'moment';
import fetch from 'node-fetch';
import 'moment-duration-format';
import { KlasaMessage } from 'klasa';

export default class NPMCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['npm-package'],
            name: 'npm',
            description: 'Get information on an NPM package',
            requiredPermissions: ['EMBED_LINKS'],
            usage: '<pkg:string>'
        });
    }

    public async run(msg: KlasaMessage, [pkg]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        pkg = this.parse(pkg);
        const res = await fetch(`https://registry.npmjs.com/${pkg}`);
        if (res.status === 404) {
            throw 'No package with that name was found';
        }

        const body = await res.json();
        if (body.time.unpublished) {
            throw 'That package was unpublished';
        }

        const version = body.versions[body['dist-tags'].latest];
        const maintainers = this.trimArray(body.maintainers.map((user: { name: string }): string => user.name));
        const dependencies = version.dependencies ? this.trimArray(Object.keys(version.dependencies)) : null;
        const embed = this.client.util.embed()
            .setColor(0xCB0000)
            .setAuthor('NPM', 'https://i.imgur.com/ErKf5Y0.png', 'https://www.npmjs.com')
            .setTitle(body.name)
            .setURL(`https://npmjs.com/package/${pkg}`)
            .setDescription(body.description || 'No description')
            .addField('❯ Version', body['dist-tags'].latest, true)
            .addField('❯ License', body.license || 'None', true)
            .addField('❯ Author', body.author ? body.author.name : '???', true)
            .addField('❯ Creation Date', moment.utc(body.time.created).format('YYYY/MM/DD hh:mm:ss'), true)
            .addField('❯ Modification Date', moment.utc(body.time.modified).format('YYYY/MM/DD hh:mm:ss'), true)
            .addField('❯ Main File', version.main || 'index.js', true)
            .addField('❯ Dependencies', dependencies && dependencies.length ? dependencies.join(', ') : 'None')
            .addField('❯ Maintainers', maintainers.join(', '));

        return msg.sendEmbed(embed);
    }

    private parse(pkg: string): string {
        return encodeURIComponent(pkg.replace(/ /g, '-'));
    }

    private trimArray(arr: string[]): string[] {
        if (arr.length > 10) {
            const len = arr.length - 10;
            arr = arr.slice(0, 10);
            arr.push(`${len} more...`);
        }

        return arr;
    }
}