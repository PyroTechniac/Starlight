// Import all the functions and structures needed
import { config } from 'dotenv';
import 'reflect-metadata';
import { Structures } from 'discord.js';
import { StarlightGuild } from './extensions/StarlightGuild';
import { StarlightMessage } from './extensions/StarlightMessage';
import './schemas/Clients';
import './schemas/Guilds';
import './schemas/Users';
// Extend the structures.
Structures.extend('Guild', (): typeof StarlightGuild => StarlightGuild);
Structures.extend('Message', (): typeof StarlightMessage => StarlightMessage);
// Populate the process.env
config();
