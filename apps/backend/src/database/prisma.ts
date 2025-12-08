import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// TRULY LAZY - Only create Prisma when actually accessed
// This prevents ANY initialization on import
function getPrisma() {
  if (!globalForPrisma.prisma) {
    const dbUrl = process.env.DATABASE_URL || '';
    const urlWithTimeout = dbUrl.includes('?') 
      ? `${dbUrl}&connect_timeout=5&pool_timeout=5`
      : `${dbUrl}?connect_timeout=5&pool_timeout=5`;

    globalForPrisma.prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: urlWithTimeout,
        },
      },
    });
  }
  return globalForPrisma.prisma;
}

// Proxy to make it lazy - only creates Prisma on first property access
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  }
});

