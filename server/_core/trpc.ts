import { initTRPC } from '@trpc/server';
import { z } from 'zod';

/**
 * Initialization of tRPC backend
 * This is the root initialization of tRPC on the backend
 */
const t = initTRPC.create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router file
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Create a server-side caller
 * @example
 * const caller = appRouter.createCaller({});
 * const res = await caller.post.all();
 */
export const createCallerFactory = t.createCallerFactory;
