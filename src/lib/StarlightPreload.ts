import { config } from 'dotenv';
import 'reflect-metadata';
import { Structures } from 'discord.js';
import { StarlightMember } from './extensions/StarlightMember';

Structures.extend('GuildMember', (): typeof StarlightMember => StarlightMember);

config();
