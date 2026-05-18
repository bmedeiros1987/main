import express, { Express } from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../routers';

/**
 * Setup tRPC middleware for Express
 * This mounts the tRPC router at /api/trpc
 */
export function setupTRPC(app: Express) {
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
    })
  );
}
