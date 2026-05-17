import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getDatabase } from './data-source';
import { CdnBazy } from './optimaSchema';
import { SqlServerConnection } from './schema';

export interface SqlServerConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  port?: number;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
}

// Connection pool cache to reuse connections
const dataSources = new Map<string, DataSource>();

/**
 * Get or create a SQL Server connection
 */
export async function getSqlServerDataSource(
  config: SqlServerConfig,
  poolKey: string,
): Promise<DataSource> {
  // Check if we already have a connection for this key
  const existingDs = dataSources.get(poolKey);
  if (existingDs?.isInitialized) {
    return existingDs;
  }

  // Create new data source
  const dataSource = new DataSource({
    type: 'mssql',
    host: config.server,
    port: config.port ?? 1433,
    username: config.user,
    password: config.password,
    database: config.database,
    synchronize: false, // Never auto-sync Optima databases
    logging: false,
    entities: [CdnBazy],
    options: {
      encrypt: config.options?.encrypt ?? true,
      trustServerCertificate: config.options?.trustServerCertificate ?? false,
      enableArithAbort: true,
    },
  });

  await dataSource.initialize();
  dataSources.set(poolKey, dataSource);

  return dataSource;
}

/**
 * Get Optima config database connection from stored configuration
 */
export async function getOptimaConfigDataSource(): Promise<DataSource | null> {
  try {
    const db = await getDatabase();
    const repository = db.getRepository(SqlServerConnection);

    // Find the optima connection
    const optimaConnection = await repository.findOne({
      where: {
        name: 'optima',
        isConfigured: true,
      },
    });

    if (!optimaConnection || !optimaConnection.server || !optimaConnection.database) {
      console.warn('Optima config database not configured or incomplete');
      return null;
    }

    const config: SqlServerConfig = {
      server: optimaConnection.server,
      database: optimaConnection.database,
      user: optimaConnection.username!,
      password: optimaConnection.password!,
      port: optimaConnection.port,
      options: {
        encrypt: optimaConnection.encrypt,
        trustServerCertificate: optimaConnection.trustServerCertificate,
      },
    };

    return getSqlServerDataSource(config, 'optima-config');
  } catch (error) {
    console.error('Error loading Optima config database configuration:', error);
    return null;
  }
}

/**
 * Get Payer database connection — first tries stored SQLite config, then falls back to env vars.
 */
export async function getPayerDataSource(): Promise<DataSource | null> {
  try {
    const db = await getDatabase();
    const repository = db.getRepository(SqlServerConnection);

    // Find the payer connection
    const payerConnection = await repository.findOne({
      where: {
        name: 'payer',
        isConfigured: true,
      },
    });

    if (payerConnection?.server && payerConnection.database) {
      const config: SqlServerConfig = {
        server: payerConnection.server,
        database: payerConnection.database,
        user: payerConnection.username!,
        password: payerConnection.password!,
        port: payerConnection.port,
        options: {
          encrypt: payerConnection.encrypt,
          trustServerCertificate: payerConnection.trustServerCertificate,
        },
      };
      return getSqlServerDataSource(config, 'payer');
    }

    // Fall back to environment variables (development only)
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Payer database not configured in SQLite settings');
      return null;
    }

    const envServer = process.env.PAYER_DB_SERVER;
    const envDatabase = process.env.PAYER_DB_DATABASE;
    const envUser = process.env.PAYER_DB_USER;
    const envPassword = process.env.PAYER_DB_PASSWORD;

    if (envServer && envDatabase && envUser && envPassword) {
      const config: SqlServerConfig = {
        server: envServer,
        database: envDatabase,
        user: envUser,
        password: envPassword,
        port: Number.parseInt(process.env.PAYER_DB_PORT ?? '1433', 10),
        options: {
          encrypt: process.env.PAYER_DB_ENCRYPT !== 'false',
          trustServerCertificate: process.env.PAYER_DB_TRUST_SERVER_CERTIFICATE === 'true',
        },
      };
      return getSqlServerDataSource(config, 'payer');
    }

    console.warn('Payer database not configured (no SQLite settings; env var fallback is dev-only)');
      return null;
  } catch (error) {
    console.error('Error loading Payer database configuration:', error);
    return null;
  }
}

/**
 * Close a specific connection
 */
export async function closeDataSource(poolKey: string): Promise<void> {
  const ds = dataSources.get(poolKey);
  if (ds?.isInitialized) {
    await ds.destroy();
    dataSources.delete(poolKey);
  }
}

/**
 * Close all connections
 */
export async function closeAllDataSources(): Promise<void> {
  const closePromises = Array.from(dataSources.values())
    .filter((ds) => ds.isInitialized)
    .map((ds) => ds.destroy());
  await Promise.all(closePromises);
  dataSources.clear();
}
