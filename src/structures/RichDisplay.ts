import { MessageEmbed as Embed } from 'discord.js';


export class RichDisplay {
    public embedTemplate: Embed;
    public pages: Embed[] = [];
    public infoPage?: Embed = null;
    public emojis: RichDisplayEmojisObject = {
        first: '⏮',
        back: '◀',
        forward: '▶',
        last: '⏭',
        jump: '🔢',
        info: 'ℹ',
        stop: '⏹'
    }

    public footered: boolean = false;
    public footerPrefix: string = '';
    public footerSuffix: string = '';
    public constructor(embed: Embed = new Embed()) {
        this.embedTemplate = embed;
    }

    public get template() {
        return new Embed(this.embedTemplate);
    }

    public setEmojis(emojis: RichDisplayEmojisObject) {
        Object.assign(this.emojis, emojis);
        return this;
    }

    public setFooterPrefix(prefix: string) {
        this.footered = false;
        this.footerPrefix = prefix;
        return this;
    }

    public setFooterSuffix(suffix: string) {
        this.footered = false;
        this.footerSuffix = suffix;
        return this;
    }

    public useCustomFooters() {
        this.footered = true;
        return this;
    }
}

export interface RichDisplayEmojisObject {
    first: string;
    back: string;
    forward: string;
    last: string;
    jump: string;
    info: string;
    stop: string;
}
