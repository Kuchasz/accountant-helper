import type { AppRouter } from '@optima-helper-2/api/src/router';
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/trpc`,
    }),
  ],
});
