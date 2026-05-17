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
 * Get Payer database connection from stored configuration
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

    if (!payerConnection || !payerConnection.server || !payerConnection.database) {
      console.warn('Payer database not configured or incomplete');
      return null;
    }

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
