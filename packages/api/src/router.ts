import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db } from './db';
import { users } from './db/schema';

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
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
});

export type AppRouter = typeof appRouter;
