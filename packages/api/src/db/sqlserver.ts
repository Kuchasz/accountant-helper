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

    // Find the active config connection
    const configConnection = await repository.findOne({
      where: {
        type: 'config',
        isActive: true,
      },
    });

    if (!configConnection) {
      console.warn('No active Optima config database connection found in database');
      return null;
    }

    const config: SqlServerConfig = {
      server: configConnection.server,
      database: configConnection.database,
      user: configConnection.username,
      password: configConnection.password,
      port: configConnection.port,
      options: {
        encrypt: configConnection.encrypt,
        trustServerCertificate: configConnection.trustServerCertificate,
      },
    };

    return getSqlServerDataSource(config, 'optima-config');
  } catch (error) {
    console.error('Error loading Optima config database configuration:', error);
    return null;
  }
}

/**
 * Get a company database connection using stored configuration
 */
export async function getCompanyDataSource(connectionConfig: {
  server: string;
  database: string;
  username: string;
  password: string;
  port: number;
  encrypt: boolean;
  trustServerCertificate: boolean;
}): Promise<DataSource> {
  const config: SqlServerConfig = {
    server: connectionConfig.server,
    database: connectionConfig.database,
    user: connectionConfig.username,
    password: connectionConfig.password,
    port: connectionConfig.port,
    options: {
      encrypt: connectionConfig.encrypt,
      trustServerCertificate: connectionConfig.trustServerCertificate,
    },
  };

  const poolKey = `company-${connectionConfig.database}`;
  return getSqlServerDataSource(config, poolKey);
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
