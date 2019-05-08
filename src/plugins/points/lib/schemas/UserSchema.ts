import { Client, SchemaFolder } from 'klasa';

export const UserSchema = Client.defaultUserSchema
    .add('points', (points): SchemaFolder => points
        .add('count', 'integer', { default: 0, configurable: false })
        .add('receivedInitial', 'boolean', { default: false, configurable: false }));