// Import all the functions and structures needed
import { Structures } from 'discord.js';
import { config } from 'dotenv';
import 'reflect-metadata';
import { StarlightGuild } from './extensions/StarlightGuild';
import { StarlightMessage } from './extensions/StarlightMessage';
import './schemas/Clients';
import './schemas/Guilds';
import './schemas/Users';
import './setup/PermissionLevels';
// Extend the structures.
Structures.extend('Guild', (): typeof StarlightGuild => StarlightGuild);
Structures.extend('Message', (): typeof StarlightMessage => StarlightMessage);
// Populate the process.env
config();
