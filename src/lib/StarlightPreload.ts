import { config } from 'dotenv';
import 'reflect-metadata';
import { Structures } from 'discord.js';
import { StarlightMember } from './extensions/StarlightMember';
import { StarlightGuild } from './extensions/StarlightGuild';
import './schemas/Clients';
import './schemas/Guilds';

Structures.extend('GuildMember', (): typeof StarlightMember => StarlightMember);
Structures.extend('Guild', (): typeof StarlightGuild => StarlightGuild);

config();
