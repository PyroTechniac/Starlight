// Import all the functions and structures needed
import { Structures } from 'discord.js';
import { config } from 'dotenv';
import 'reflect-metadata';
import { StarlightGuild } from './extensions/StarlightGuild';
import { StarlightMessage } from './extensions/StarlightMessage';
import { StarlightUser } from './extensions/StarlightUser';
import './schemas/Clients';
import './schemas/Guilds';
import './schemas/Users';
// Extend the structures.
Structures.extend('Guild', (): typeof StarlightGuild => StarlightGuild);
Structures.extend('Message', (): typeof StarlightMessage => StarlightMessage);
Structures.extend('User', (): typeof StarlightUser => StarlightUser);
// Populate the process.env
config();
