import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { getDatabase } from './db/index.js';
import { CdnBazy } from './db/optimaSchema.js';
import { Setting, SqlServerConnection, User } from './db/schema.js';
import {
  getOptimaConfigDataSource,
  getPayerDataSource,
  getSqlServerDataSource,
} from './db/sqlserver.js';
import type { SqlServerConfig } from './db/sqlserver.js';

const t = initTRPC.create({
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const sqlServerConnectionSchema = z.object({
  name: z.enum(['optima', 'payer']),
  server: z.string().min(1).optional(),
  database: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  port: z.number().int().default(1433),
  encrypt: z.boolean().default(true),
  trustServerCertificate: z.boolean().default(false),
  isConfigured: z.boolean().default(false),
});

export const appRouter = t.router({
  hello: t.procedure.input(z.object({ name: z.string().optional() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.name ?? 'World'}!`,
      timestamp: new Date().toISOString(),
    };
  }),

  getUsers: t.procedure.query(async () => {
    const db = await getDatabase();
    const userRepository = db.getRepository(User);
    return userRepository.find();
  }),

  createUser: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDatabase();
      const userRepository = db.getRepository(User);
      const user = userRepository.create(input);
      return userRepository.save(user);
    }),

  // SQL Server Connections Management
  getSqlServerConnections: t.procedure.query(async () => {
    const db = await getDatabase();
    const repository = db.getRepository(SqlServerConnection);

    // Ensure both connections exist
    const connections = await repository.find();
    const hasOptima = connections.some((c) => c.name === 'optima');
    const hasPayer = connections.some((c) => c.name === 'payer');

    if (!hasOptima) {
      const optima = repository.create({ name: 'optima', isConfigured: false });
      await repository.save(optima);
    }

    if (!hasPayer) {
      const payer = repository.create({ name: 'payer', isConfigured: false });
      await repository.save(payer);
    }

    return repository.find({ order: { name: 'ASC' } });
  }),

  getSqlServerConnection: t.procedure
    .input(z.object({ name: z.enum(['optima', 'payer']) }))
    .query(async ({ input }) => {
      const db = await getDatabase();
      const repository = db.getRepository(SqlServerConnection);
      return repository.findOne({ where: { name: input.name } });
    }),

  updateSqlServerConnection: t.procedure
    .input(
      z.object({
        name: z.enum(['optima', 'payer']),
        data: sqlServerConnectionSchema.partial().omit({ name: true }),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDatabase();
      const repository = db.getRepository(SqlServerConnection);

      // Find by name
      const existing = await repository.findOne({ where: { name: input.name } });

      if (!existing) {
        // Create if doesn't exist
        const connection = repository.create({ name: input.name, ...input.data });
        return repository.save(connection);
      }

      await repository.update(existing.id, input.data);
      return repository.findOne({ where: { id: existing.id } });
    }),

  testSqlServerConnection: t.procedure
    .input(
      z.object({
        server: z.string().min(1),
        database: z.string().min(1),
        username: z.string().min(1),
        password: z.string().min(1),
        port: z.number().int().default(1433),
        encrypt: z.boolean().default(true),
        trustServerCertificate: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const config: SqlServerConfig = {
          server: input.server,
          database: input.database,
          user: input.username,
          password: input.password,
          port: input.port,
          options: {
            encrypt: input.encrypt,
            trustServerCertificate: input.trustServerCertificate,
          },
        };

        const testDs = await getSqlServerDataSource(config, `test-${Date.now()}`);
        // Try a simple query to verify connection
        await testDs.query('SELECT 1');

        return { success: true, message: 'Connection successful' };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Connection failed',
        };
      }
    }),

  testOptimaConnection: t.procedure.query(async () => {
    try {
      const configDs = await getOptimaConfigDataSource();
      if (!configDs) {
        return {
          success: false,
          message: 'Optima database credentials not configured',
        };
      }
      // Try a simple query to verify connection
      await configDs.query('SELECT 1');
      return { success: true, message: 'Optima database connection successful' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }),

  testPayerConnection: t.procedure.query(async () => {
    try {
      const payerDs = await getPayerDataSource();
      if (!payerDs) {
        return {
          success: false,
          message: 'Payer database credentials not configured',
        };
      }
      // Try a simple query to verify connection
      await payerDs.query('SELECT 1');
      return { success: true, message: 'Payer database connection successful' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }),

  // Settings Management
  getSettings: t.procedure.query(async () => {
    const db = await getDatabase();
    const repository = db.getRepository(Setting);
    return repository.find();
  }),

  getSetting: t.procedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
    const db = await getDatabase();
    const repository = db.getRepository(Setting);
    return repository.findOne({ where: { key: input.key } });
  }),

  setSetting: t.procedure
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDatabase();
      const repository = db.getRepository(Setting);

      const existing = await repository.findOne({ where: { key: input.key } });

      if (existing) {
        await repository.update(existing.id, {
          value: input.value,
          description: input.description,
        });
        return repository.findOne({ where: { id: existing.id } });
      }

      const setting = repository.create(input);
      return repository.save(setting);
    }),

  deleteSetting: t.procedure.input(z.object({ key: z.string() })).mutation(async ({ input }) => {
    const db = await getDatabase();
    const repository = db.getRepository(Setting);
    await repository.delete({ key: input.key });
    return { success: true };
  }),

  checkOptimaAvailable: t.procedure.query(async () => {
    try {
      const configDs = await getOptimaConfigDataSource();
      if (!configDs) {
        return { available: false };
      }
      await configDs.query('SELECT 1');
      return { available: true };
    } catch (error) {
      return { available: false };
    }
  }),

  // Alias for backwards compatibility
  checkConfigDbAvailable: t.procedure.query(async () => {
    try {
      const configDs = await getOptimaConfigDataSource();
      if (!configDs) {
        return { available: false };
      }
      await configDs.query('SELECT 1');
      return { available: true };
    } catch (error) {
      return { available: false };
    }
  }),

  checkPayerAvailable: t.procedure.query(async () => {
    try {
      const payerDs = await getPayerDataSource();
      if (!payerDs) {
        return { available: false };
      }
      await payerDs.query('SELECT 1');
      return { available: true };
    } catch (error) {
      return { available: false };
    }
  }),

  // Optima Database queries (only if available)
  getAvailableCompanies: t.procedure.query(async () => {
    try {
      const configDs = await getOptimaConfigDataSource();
      if (!configDs) {
        return [];
      }

      // Query CDN.Bazy table for available databases using TypeORM
      const repository = configDs.getRepository(CdnBazy);
      const companies = await repository.find({
        where: { nieaktywna: 0 }, // 0 = active, 1 = inactive
        order: { name: 'ASC' },
      });

      return companies.map((company) => ({
        id: company.id,
        name: company.name,
        databaseName: company.databaseName,
        serverName: company.serverName,
        isActive: company.isActive,
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }),

  getSelectedCompany: t.procedure.query(async () => {
    const db = await getDatabase();
    const repository = db.getRepository(Setting);
    const setting = await repository.findOne({ where: { key: 'selected_company_id' } });

    if (!setting) {
      return null;
    }

    try {
      return JSON.parse(setting.value);
    } catch {
      return null;
    }
  }),

  setSelectedCompany: t.procedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        databaseName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDatabase();
      const repository = db.getRepository(Setting);

      const existing = await repository.findOne({ where: { key: 'selected_company_id' } });
      const value = JSON.stringify(input);

      if (existing) {
        await repository.update(existing.id, {
          value,
          description: 'Currently selected company database',
        });
        return repository.findOne({ where: { id: existing.id } });
      }

      const setting = repository.create({
        key: 'selected_company_id',
        value,
        description: 'Currently selected company database',
      });
      return repository.save(setting);
    }),

  // Payer database queries
  getPayersList: t.procedure.query(async () => {
    const payerDs = await getPayerDataSource();
    if (!payerDs) {
      return [];
    }
    const rows = await payerDs.query<Array<{ ID: number; NAZWASKR: string; LAST_SENT: Date | null }>>(
      `SELECT p.ID, p.NAZWASKR, MAX(pr.DATA_WYS_ODB) AS LAST_SENT
      FROM PLATNIK p
      LEFT JOIN PRZESYLKA pr
        ON pr.ID_PLATNIK = p.ID
        AND pr.RODZAJ = 'D'
        AND pr.TYP = 'Z'
        AND pr.POZIOM = 0
      WHERE p.STATUS_AKTYWNOSCI = 'A'
      GROUP BY p.ID, p.NAZWASKR
      ORDER BY p.NAZWASKR
    `);
    return (rows as Array<{ ID: number; NAZWASKR: string; LAST_SENT: Date | null }>).map((r) => ({
      id: r.ID,
      name: r.NAZWASKR,
      lastSentDate: r.LAST_SENT ? r.LAST_SENT.toISOString() : null,
    }));
  }),
});

export type AppRouter = typeof appRouter;
