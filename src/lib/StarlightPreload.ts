import { config } from 'dotenv';
import 'reflect-metadata';
import { Structures } from 'discord.js';
import { StarlightMember } from './extensions/StarlightMember';
import { StarlightGuild } from './extensions/StarlightGuild';

Structures.extend('GuildMember', (): typeof StarlightMember => StarlightMember);
Structures.extend('Guild', (): typeof StarlightGuild => StarlightGuild);

config();
