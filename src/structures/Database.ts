import { config } from 'dotenv';
import { ConnectionManager } from 'typeorm';
import { Case, Tag, Reminder, RoleState, Setting } from '../models/index';
config();

const connectionManager = new ConnectionManager();
connectionManager.create({
    name: 'sunshine',
    type: 'postgres',
    url: process.env.DATABASE,
    entities: [Setting, Tag, RoleState, Case, Reminder],
    ssl: true
});

export default connectionManager;
