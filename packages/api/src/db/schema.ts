import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Settings table for storing application configuration
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// SQL Server connections configuration (for Comarch Optima databases)
export const sqlServerConnections = sqliteTable('sql_server_connections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(), // e.g., "config", "company1", "company2"
  type: text('type').notNull(), // "config" or "company"
  server: text('server').notNull(),
  database: text('database').notNull(),
  username: text('username').notNull(),
  password: text('password').notNull(), // Should be encrypted in production
  port: integer('port').notNull().default(1433),
  encrypt: integer('encrypt', { mode: 'boolean' }).notNull().default(true),
  trustServerCertificate: integer('trust_server_certificate', { mode: 'boolean' })
    .notNull()
    .default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
