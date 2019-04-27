import 'reflect-metadata';
import StarlightClient from './client/StarlightClient';
import { config } from 'dotenv';
import { ShardingManager } from 'kurasuta';
import { join } from 'path';
config();

const sharder = new ShardingManager(join(__dirname, 'main'), {
    client: StarlightClient,
    token: process.env.TOKEN
});

sharder.spawn();
