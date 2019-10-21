// Import all the functions and structures needed
import { config } from 'dotenv';
import 'reflect-metadata';
import { Structures } from 'discord.js';
import { StarlightMember } from './extensions/StarlightMember';
import { StarlightGuild } from './extensions/StarlightGuild';
import { StarlightMessage } from './extensions/StarlightMessage';
import './schemas/Clients';
import './schemas/Guilds';
// Extend the structures.
Structures.extend('GuildMember', (): typeof StarlightMember => StarlightMember);
Structures.extend('Guild', (): typeof StarlightGuild => StarlightGuild);
Structures.extend('Message', (): typeof StarlightMessage => StarlightMessage);
// Populate the process.env
config();
