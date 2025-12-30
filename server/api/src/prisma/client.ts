import { PrismaClient } from '@prisma/client';

// Avoid re-creating PrismaClient in development (e.g., hot reloads)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export type PrismaTransaction = Parameters<PrismaClient['$transaction']>[0];
