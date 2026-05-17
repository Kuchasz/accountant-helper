import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getDatabase } from './data-source.js';
import { CdnBazy } from './optimaSchema.js';
import { SqlServerConnection } from './schema.js';

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

export interface OptimaCompanyConnectionTarget {
  database: string;
  server?: string;
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
      if (process.env.NODE_ENV !== 'development') {
        console.warn('Optima config database not configured or incomplete');
        return null;
      }

      const envServer = process.env.OPTIMA_CONFIG_SERVER;
      const envDatabase = process.env.OPTIMA_CONFIG_DATABASE;
      const envUser = process.env.OPTIMA_CONFIG_USER;
      const envPassword = process.env.OPTIMA_CONFIG_PASSWORD;

      if (!envServer || !envDatabase || !envUser || !envPassword) {
        console.warn(
          'Optima config database not configured (no SQLite settings; env var fallback is dev-only)',
        );
        return null;
      }

      const config: SqlServerConfig = {
        server: envServer,
        database: envDatabase,
        user: envUser,
        password: envPassword,
        port: Number.parseInt(process.env.OPTIMA_CONFIG_PORT ?? '1433', 10),
        options: {
          encrypt: process.env.OPTIMA_CONFIG_ENCRYPT !== 'false',
          trustServerCertificate: process.env.OPTIMA_CONFIG_TRUST_SERVER_CERTIFICATE === 'true',
        },
      };

      return getSqlServerDataSource(config, 'optima-config-env');
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
 * Get an Optima company database connection. In development this uses the
 * sample company connection from .env and lets callers override database/server
 * for each company listed in CDN.Bazy.
 */
export async function getOptimaCompanyDataSource(
  target?: OptimaCompanyConnectionTarget,
): Promise<DataSource | null> {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Optima company database env fallback is development-only');
    return null;
  }

  const envServer = process.env.OPTIMA_COMPANY_SERVER;
  const envDatabase = process.env.OPTIMA_COMPANY_DATABASE;
  const envUser = process.env.OPTIMA_COMPANY_USER;
  const envPassword = process.env.OPTIMA_COMPANY_PASSWORD;

  if (!envServer || !envDatabase || !envUser || !envPassword) {
    console.warn('Optima company database not configured in env vars');
    return null;
  }

  const database = target?.database || envDatabase;
  const server = target?.server || envServer;
  const config: SqlServerConfig = {
    server,
    database,
    user: envUser,
    password: envPassword,
    port: Number.parseInt(process.env.OPTIMA_COMPANY_PORT ?? '1433', 10),
    options: {
      encrypt: process.env.OPTIMA_COMPANY_ENCRYPT !== 'false',
      trustServerCertificate: process.env.OPTIMA_COMPANY_TRUST_SERVER_CERTIFICATE === 'true',
    },
  };

  return getSqlServerDataSource(config, `optima-company-${server}-${database}`);
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

    console.warn(
      'Payer database not configured (no SQLite settings; env var fallback is dev-only)',
    );
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
