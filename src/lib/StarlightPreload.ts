import { config } from 'dotenv';
import 'reflect-metadata';
import { addAliases } from 'module-alias'
import './extensions';
import { resolve } from 'path';

addAliases({
    // '@settings': `${__dirname}/lib/settings`,
    // '@structures': `${__dirname}/lib/structures`,
    // '@utils': `${__dirname}/lib/util`,
    // '@typings': `${__dirname}/lib/types`
    '@settings': resolve(__dirname, 'settings'),
    '@structures': resolve(__dirname, 'structures'),
    '@utils': resolve(__dirname, 'util'),
    '@typings': resolve(__dirname, 'types')
});

config();
