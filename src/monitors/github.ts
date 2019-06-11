import { Monitor, MonitorStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';
import { MessageEmbed, MessageReaction } from 'discord.js';
import { KlasaUser } from 'klasa';

class Issue extends Monitor {
    public constructor(store: MonitorStore, file: string[], directory: string) {
        super(store, file, directory, {
            ignoreOthers: false,
            ignoreEdits: false
        });
    }

    private static regex: RegExp = /(?:^|\s)#(\d+)\b/;

    private colors = {
        pullRequests: {
            open: 0x2CBE4E,
            closed: 0xCB2431,
            merged: 0x6F42C1
        },
        issues: {
            open: 0xD1D134,
            closed: 0x2D32BE
        }
    }

    public async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | undefined> {
        const exec = Issue.regex.exec(message.content);

        if (exec === null) return;

        const id = exec[1];
        let response: MessageEmbed, reacter: KlasaUser;
        try {
            await message.react('🔖');
            reacter = await message.awaitReactions((reaction: MessageReaction, user: KlasaUser): boolean => reaction.emoji.name === '🔖' && !user.bot, {
                time: 30000,
                max: 1,
                errors: ['time']
            }).then((r): KlasaUser => r.first()!.users.find((u): boolean => !u.bot)!);

            let data = await fetch(`https://api.github.com/repos/dirigeants/klasa/pulls/${exec[1]}`)
                .then((res): any => res.json());

            if (data.message !== 'Not Found') {
                response = this.pullRequest(data);
            } else {
                data = await fetch(`https://api.github.com/repos/dirigeants/klasa/issues/${exec[1]}`)
                    .then((res): any => res.json());

                if (data.message !== 'Not Found') response = this.issue(data);
            }
        } catch(err) {
            // noop
        }

        if (message.deleted) return;

        await message.reactions.removeAll();

        // @ts-ignore
        if (!response) return;

        const msg: KlasaMessage = await message.sendEmbed(response) as KlasaMessage;

        try {
            await msg.react('🗑');
            await msg.awaitReactions((reaction: MessageReaction, user: KlasaUser): boolean => reaction.emoji.name === '🗑' && user === reacter, {
                time: 60000,
                max: 1,
                errors: ['time']
            });
            await msg.delete();
        } catch(err) {
            if (msg.deleted) return;

            await msg.reactions.removeAll();
        }
    }

    private _shared(data): MessageEmbed {
        const description: string = data.body.length > 2048 ? `${data.body.slice(0, 2045)}...` : data.body;

        const labels = data.labels ? data.labels.map((label): string => label.name) : 'None';

        return this.client.util.embed()
            .setThumbnail('https://raw.githubusercontent.com/dirigeants/klasa-website/master/public/static/klasa.png')
            .setAuthor(data.user.login, data.user.avatar_url, data.user.html_url)
            .setTitle(data.title)
            .setURL(data.html_url)
            .setDescription(description)
            .setTimestamp(new Date(data.created_at))
            .addField('__**Status:**__', data.state, true)
            .addField('__**Labels:**__', labels, true);
    }

    private issue(data): MessageEmbed {
        return this._shared(data)
            .setColor(this.colors.issues[data.state])
            .setFooter(`Issue: ${data.number}`);
    }

    private pullRequest(data: { state: string; merged: any; additions: any; deletions: any; commits: any; changed_files: any; number: any; head: { repo: { full_name: any }; ref: any } }): MessageEmbed {
        const state = data.state === 'closed' && data.merged ? 'merged' : data.state;
        const embed = this._shared(data)
            .setColor(this.colors.pullRequests[state])
            .addField('__**Additions:**__', data.additions, true)
            .addField('__**Deletions:**__', data.deletions, true)
            .addField('__**Commits:**__', data.commits, true)
            .addField('__**Files Changed:**__', data.changed_files, true)
            .setFooter(`Pull Request: ${data.number}`);
        if (data.head.repo && data.state !== 'closed') embed.addField('__**Install With:**__', `\`npm i ${data.head.repo.full_name}#${data.head.ref}\``);
        return embed;
    }
}

export default Issue;