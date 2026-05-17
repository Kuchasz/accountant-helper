import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { JpkVatDeclarationStatus, Setting, SqlServerConnection, User } from './schema.js';

// SQLite data source for local application database
export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DATABASE_URL || './data/db.sqlite',
  synchronize: true, // Auto-create tables in development
  logging: false,
  entities: [User, Setting, SqlServerConnection, JpkVatDeclarationStatus],
  migrations: [],
  subscribers: [],
});

// Initialize the data source
let initialized = false;

export async function initializeDatabase() {
  if (!initialized) {
    await AppDataSource.initialize();
    initialized = true;
    console.log('SQLite Data Source has been initialized!');
  }
  return AppDataSource;
}

export async function getDatabase() {
  if (!initialized) {
    await initializeDatabase();
  }
  return AppDataSource;
}
