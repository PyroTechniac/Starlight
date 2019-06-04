import { StarlightClient } from './client/StarlightClient';
import { config } from 'dotenv';
config();

new StarlightClient({
    token: process.env.TOKEN,
    prefix: process.env.PREFIX,
    xboxID: process.env.XBOX_ID,
    xboxIP: process.env.XBOX_IP,
    commandEditing: true
}).start();