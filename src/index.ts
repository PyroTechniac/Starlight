import { config } from 'dotenv';
import 'reflect-metadata';
import StarlightClient from './client/StarlightClient';
config();

new StarlightClient({
    disableEveryone: true,
    disabledEvents: ['TYPING_START']
}).start();
