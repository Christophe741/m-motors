/**
 * Prisma Client Singleton
 *
 * This singleton pattern prevents multiple Prisma Client instances
 * during Next.js hot-reloading in development, which can exhaust
 * database connections.
 */

import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var pool: Pool | undefined;
}

// Create connection pool
const pool =
  global.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.pool = pool;
}

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client
export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
