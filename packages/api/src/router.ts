import { initTRPC } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './db';
import { settings, sqlServerConnections, users } from './db/schema';
import { getOptimaConfigDb, getSqlServerDb } from './db/sqlserver';
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
    const allUsers = await db.select().from(users);
    return allUsers;
  }),

  createUser: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      const [user] = await db.insert(users).values(input).returning();
      return user;
    }),

  // SQL Server Connections Management
  getSqlServerConnections: t.procedure.query(async () => {
    return db.select().from(sqlServerConnections);
  }),

  getSqlServerConnection: t.procedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const [connection] = await db
        .select()
        .from(sqlServerConnections)
        .where(eq(sqlServerConnections.id, input.id));
      return connection;
    }),

  createSqlServerConnection: t.procedure
    .input(sqlServerConnectionSchema)
    .mutation(async ({ input }) => {
      const [connection] = await db
        .insert(sqlServerConnections)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return connection;
    }),

  updateSqlServerConnection: t.procedure
    .input(
      z.object({
        id: z.number().int(),
        data: sqlServerConnectionSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const [connection] = await db
        .update(sqlServerConnections)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(sqlServerConnections.id, input.id))
        .returning();
      return connection;
    }),

  deleteSqlServerConnection: t.procedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await db.delete(sqlServerConnections).where(eq(sqlServerConnections.id, input.id));
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

        const testDb = await getSqlServerDb(config, `test-${Date.now()}`);
        // Try a simple query to verify connection
        await testDb.execute('SELECT 1');

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
      const configDb = await getOptimaConfigDb();
      if (!configDb) {
        return {
          success: false,
          message: 'Optima config database credentials not configured',
        };
      }
      // Try a simple query to verify connection
      await configDb.execute('SELECT 1');
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
    return db.select().from(settings);
  }),

  getSetting: t.procedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
    const [setting] = await db.select().from(settings).where(eq(settings.key, input.key));
    return setting;
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
      const existing = await db.select().from(settings).where(eq(settings.key, input.key));

      if (existing.length > 0) {
        const [setting] = await db
          .update(settings)
          .set({
            value: input.value,
            description: input.description,
            updatedAt: new Date(),
          })
          .where(eq(settings.key, input.key))
          .returning();
        return setting;
      }
      const [setting] = await db
        .insert(settings)
        .values({
          key: input.key,
          value: input.value,
          description: input.description,
          updatedAt: new Date(),
        })
        .returning();
      return setting;
    }),

  deleteSetting: t.procedure.input(z.object({ key: z.string() })).mutation(async ({ input }) => {
    await db.delete(settings).where(eq(settings.key, input.key));
    return { success: true };
  }),
});

export type AppRouter = typeof appRouter;
