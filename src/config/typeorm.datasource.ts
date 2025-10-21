import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { ConnectionNames, DbConnections } from './typeorm.config';

config({ override: true });

// Use the same connection options as the Nest runtime
const defaultConnectionOptions = DbConnections()[ConnectionNames.DEFAULT];

const dataSource = new DataSource(defaultConnectionOptions);
export default dataSource;
