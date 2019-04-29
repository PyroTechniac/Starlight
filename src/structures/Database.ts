import { config } from 'dotenv';
import { ConnectionManager } from 'typeorm';
import { Case, Reminder, RoleState, Setting, Tag } from '../models/index';
config();

const connectionManager = new ConnectionManager();
connectionManager.create({
    name: 'Starlight',
    type: 'postgres',
    url: process.env.DATABASE,
    entities: [Setting, Tag, RoleState, Case, Reminder],
    ssl: true
});

export default connectionManager;
