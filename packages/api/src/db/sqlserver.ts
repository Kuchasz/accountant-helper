import { drizzle } from 'drizzle-orm/node-mssql';
import type { NodeMsSqlDatabase } from 'drizzle-orm/node-mssql';
import sql from 'mssql';

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
const connectionPools = new Map<string, sql.ConnectionPool>();

/**
 * Get or create a SQL Server connection pool
 */
export async function getConnectionPool(
  config: SqlServerConfig,
  poolKey: string,
): Promise<sql.ConnectionPool> {
  // Check if we already have a connection pool for this key
  const existingPool = connectionPools.get(poolKey);
  if (existingPool?.connected) {
    return existingPool;
  }

  // Create new connection pool
  const pool = new sql.ConnectionPool({
    server: config.server,
    database: config.database,
    user: config.user,
    password: config.password,
    port: config.port ?? 1433,
    options: {
      encrypt: config.options?.encrypt ?? true,
      trustServerCertificate: config.options?.trustServerCertificate ?? false,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  });

  await pool.connect();
  connectionPools.set(poolKey, pool);

  return pool;
}

/**
 * Get Drizzle instance for a SQL Server connection
 */
export async function getSqlServerDb(
  config: SqlServerConfig,
  poolKey: string,
): Promise<NodeMsSqlDatabase> {
  const pool = await getConnectionPool(config, poolKey);
  return drizzle({ client: pool });
}

/**
 * Get Optima config database connection from environment variables
 */
export async function getOptimaConfigDb(): Promise<NodeMsSqlDatabase | null> {
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

  return getSqlServerDb(config, 'optima-config');
}

/**
 * Get a company database connection using stored configuration
 */
export async function getCompanyDb(connectionConfig: {
  server: string;
  database: string;
  username: string;
  password: string;
  port: number;
  encrypt: boolean;
  trustServerCertificate: boolean;
}): Promise<NodeMsSqlDatabase> {
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
  return getSqlServerDb(config, poolKey);
}

/**
 * Close a specific connection pool
 */
export async function closeConnectionPool(poolKey: string): Promise<void> {
  const pool = connectionPools.get(poolKey);
  if (pool) {
    await pool.close();
    connectionPools.delete(poolKey);
  }
}

/**
 * Close all connection pools
 */
export async function closeAllConnections(): Promise<void> {
  const closePromises = Array.from(connectionPools.values()).map((pool) => pool.close());
  await Promise.all(closePromises);
  connectionPools.clear();
}
