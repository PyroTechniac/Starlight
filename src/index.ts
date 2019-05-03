import { config } from 'dotenv';
import 'reflect-metadata';
import StarlightClient from './client/StarlightClient';
config();

new StarlightClient().start();