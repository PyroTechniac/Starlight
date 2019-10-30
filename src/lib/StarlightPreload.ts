// Import all the functions and structures needed
import { Structures } from 'discord.js';
import { config } from 'dotenv';
import 'reflect-metadata';
import { StarlightGuild } from './extensions/StarlightGuild';
import { StarlightMember } from './extensions/StarlightMember';
import { StarlightMessage } from './extensions/StarlightMessage';
import './schemas/Clients';
import './schemas/Guilds';
import './schemas/Users';
// Extend the structures.
Structures.extend('Guild', (): typeof StarlightGuild => StarlightGuild);
Structures.extend('GuildMember', (): typeof StarlightMember => StarlightMember);
Structures.extend('Message', (): typeof StarlightMessage => StarlightMessage);
// Populate the process.env
config();
