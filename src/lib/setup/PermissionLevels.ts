import { KlasaClient } from 'klasa';
import { Permissions } from 'discord.js';
import { PermissionLevels } from '../types/Enums';

export default KlasaClient.defaultPermissionLevels
	.add(PermissionLevels.Staff, (message): boolean => message.member
		? message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)
		: false, { fetch: true })
	.add(PermissionLevels.Moderator, (message): boolean => message.member
		? message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)
		: false, { fetch: true })
	.add(PermissionLevels.Administrator, (message): boolean => message.member
		? message.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
		: false, { fetch: true });
