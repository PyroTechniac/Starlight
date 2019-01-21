const { ArgumentType } = require('discord.js-commando');
const fileTypeRe = /\.(jpe?g|png|gif)$/i;
module.exports = class ImageArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'image');
    }
    validate(value, message, arg) {
        const attachment = message.attachments.first();
        if (attachment) {
            if (!attachment.height || !attachment.width) return false;
            if (attachment.size > 8e+6) return 'Please provide an image under 8 MB.';
            if (!fileTypeRe.test(attachment.name)) return 'Please only send PNG, JPG, or GIF format images.';
            return true;
        }
        return this.client.registry.types.get('user').validate(value, message, arg);
    }
    async parse(value, message, arg) {
        const attachment = message.attachments.first();
        if (attachment) return attachment.url;
        const user = await this.client.registry.types.get('user').parse(value, message, arg);
        return user.displayAvatarURL({ format: 'png', size: 512 });
    }
    isEmpty(value, message, arg) {
        if (message.attachments.size) return false;
        return this.client.registry.get('user').isEmpty(value, message, arg);
    }
};