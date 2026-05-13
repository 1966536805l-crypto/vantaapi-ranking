import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const BUILD_ONLY_DATABASE_URL = "postgresql://build:build@localhost:5432/build?sslmode=disable";

function databaseUrl() {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) return connectionString;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return BUILD_ONLY_DATABASE_URL;
  }

  throw new Error("DATABASE_URL is required");
}

function createPostgresAdapter(url: string) {
  const databaseUrl = new URL(url);
  if (databaseUrl.protocol !== "postgres:" && databaseUrl.protocol !== "postgresql:") {
    console.warn("DATABASE_URL should start with postgres:// or postgresql:// for the Vercel/Neon production setup");
  }

  return new PrismaPg(url);
}

const adapter = createPostgresAdapter(databaseUrl());

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
