import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { getDatabase } from './db';
import { CdnBazy } from './db/optimaSchema';
import { Setting, SqlServerConnection, User } from './db/schema';
import { getOptimaConfigDataSource, getSqlServerDataSource } from './db/sqlserver';
import type { SqlServerConfig } from './db/sqlserver';

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
  name: z.string().min(1),
  type: z.enum(['config', 'company']),
  server: z.string().min(1),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  port: z.number().int().default(1433),
  encrypt: z.boolean().default(true),
  trustServerCertificate: z.boolean().default(false),
  isActive: z.boolean().default(true),
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
    return repository.find();
  }),

  getSqlServerConnection: t.procedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getDatabase();
      const repository = db.getRepository(SqlServerConnection);
      return repository.findOne({ where: { id: input.id } });
    }),

  createSqlServerConnection: t.procedure
    .input(sqlServerConnectionSchema)
    .mutation(async ({ input }) => {
      const db = await getDatabase();
      const repository = db.getRepository(SqlServerConnection);
      const connection = repository.create(input);
      return repository.save(connection);
    }),

  updateSqlServerConnection: t.procedure
    .input(
      z.object({
        id: z.number().int(),
        data: sqlServerConnectionSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDatabase();
      const repository = db.getRepository(SqlServerConnection);
      await repository.update(input.id, input.data);
      return repository.findOne({ where: { id: input.id } });
    }),

  deleteSqlServerConnection: t.procedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDatabase();
      const repository = db.getRepository(SqlServerConnection);
      await repository.delete(input.id);
      return { success: true };
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

  testOptimaConfigConnection: t.procedure.query(async () => {
    try {
      const configDs = await getOptimaConfigDataSource();
      if (!configDs) {
        return {
          success: false,
          message: 'Optima config database credentials not configured',
        };
      }
      // Try a simple query to verify connection
      await configDs.query('SELECT 1');
      return { success: true, message: 'Optima config database connection successful' };
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

  // Company Database Selection
  getAvailableCompanies: t.procedure.query(async () => {
    try {
      const configDs = await getOptimaConfigDataSource();
      if (!configDs) {
        throw new Error('Optima config database not configured');
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
      throw new Error('Failed to fetch available companies');
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
});

export type AppRouter = typeof appRouter;
