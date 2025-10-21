import { config } from 'dotenv';
import { dirname, join } from 'path';
import { DataSourceOptions } from 'typeorm';

config({ override: true });

export const enum ConnectionNames {
  DEFAULT = 'DEFAULT',
}

export const DbConnections = () => ({
  [ConnectionNames.DEFAULT]: {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [join(dirname(__dirname), '**/*.entity.{js,ts}')],
    synchronize: false,
    autoLoadEntities: false,
    migrationsRun: false,
    connectTimeoutMS: 15 * 1000,
    maxQueryExecutionTime: 60 * 1000,
    migrationsTableName: 'migrations_typeorm',
    migrations: [join(dirname(__dirname), 'migrations/**/*.{js,ts}')],
    migrationsTransactionMode: 'none',
  } as DataSourceOptions,
});
