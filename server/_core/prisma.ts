import { PrismaClient } from "@prisma/client";
import { ENV } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient();
}

export async function getPrismaClient(): Promise<PrismaClient | null> {
  if (!ENV.databaseUrl) {
    console.warn("[Database] DATABASE_URL is not configured.");
    return null;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}
