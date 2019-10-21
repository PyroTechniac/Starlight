// Copyright (c) 2019 kyranet. All rights reserved. Apache license.
// This is a recreation of work. The original work can be found here.
// https://github.com/kyranet/Skyra/blob/master/src/lib/structures/UserRichDisplay.ts

import { RichDisplay, ReactionHandler, KlasaMessage, RichDisplayRunOptions, util, KlasaUser } from 'klasa';
import { MessageReaction } from 'discord.js'

export class UserRichDisplay extends RichDisplay {
    public async start(message: KlasaMessage, target: string = message.author.id, options: RichDisplayRunOptions = {}): Promise<ReactionHandler> {
        util.mergeDefault<RichDisplayRunOptions>({
            filter: (_: MessageReaction, user: KlasaUser): boolean => user.id === target,
            time: 60000 * 5
        }, options);
        if (target) {
            const display = UserRichDisplay.handlers.get(target);
            if (display) display.stop();
        }

        const handler = (await this.run(message, options))
            .once('end', (): boolean => UserRichDisplay.handlers.delete(target));
        UserRichDisplay.handlers.set(target, handler);

        return handler;
    }

    public static readonly handlers: Map<string, ReactionHandler> = new Map();
}