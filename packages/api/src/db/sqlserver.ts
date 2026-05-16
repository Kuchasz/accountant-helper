import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CdnBazy } from './optimaSchema';

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
 * Get Optima config database connection from environment variables
 */
export async function getOptimaConfigDataSource(): Promise<DataSource | null> {
  const server = process.env.OPTIMA_CONFIG_SERVER;
  const database = process.env.OPTIMA_CONFIG_DATABASE;
  const user = process.env.OPTIMA_CONFIG_USER;
  const password = process.env.OPTIMA_CONFIG_PASSWORD;

  if (!server || !database || !user || !password) {
    console.warn('Optima config database credentials not configured in environment');
    return null;
  }

  const config: SqlServerConfig = {
    server,
    database,
    user,
    password,
    port: process.env.OPTIMA_CONFIG_PORT ? Number.parseInt(process.env.OPTIMA_CONFIG_PORT) : 1433,
    options: {
      encrypt: process.env.OPTIMA_CONFIG_ENCRYPT === 'true',
      trustServerCertificate: process.env.OPTIMA_CONFIG_TRUST_SERVER_CERTIFICATE === 'true',
    },
  };

  return getSqlServerDataSource(config, 'optima-config');
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
    .filter(ds => ds.isInitialized)
    .map(ds => ds.destroy());
  await Promise.all(closePromises);
  dataSources.clear();
}

