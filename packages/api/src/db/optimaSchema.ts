/**
 * Placeholder for Comarch Optima database schema definitions
 *
 * This file will contain Drizzle schema definitions for Optima tables
 * as you map them. For now, we'll use raw SQL queries through Drizzle.
 *
 * Example usage when defining schemas:
 *
 * import { mssqlTable, varchar, int, datetime } from 'drizzle-orm/mssql-core';
 *
 * export const optimaCompanies = mssqlTable('CDN.Firmy', {
 *   fir_id: int('Fir_ID').primaryKey(),
 *   fir_nama: varchar('Fir_Nazwa', { length: 255 }),
 *   // ... other fields
 * });
 */

// Export types for Optima database queries
export type OptimaConfigDatabase = Record<string, unknown>;

export type OptimaCompanyDatabase = Record<string, unknown>;
