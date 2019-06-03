import { StarlightClient } from './client/StarlightClient';
import { config } from 'dotenv';
config();

new StarlightClient({
    xboxID: process.env.XBOX_ID,
    xboxIP: process.env.XBOX_IP,
    token: process.env.TOKEN
}).start();