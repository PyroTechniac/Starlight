import 'reflect-metadata';
import StarlightClient from './client/StarlightClient';
import { config } from 'dotenv';
config();

new StarlightClient().start();
