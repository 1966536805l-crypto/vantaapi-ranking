import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

function createPostgresAdapter(url: string) {
  const databaseUrl = new URL(url);
  if (databaseUrl.protocol !== "postgres:" && databaseUrl.protocol !== "postgresql:") {
    console.warn("DATABASE_URL should start with postgres:// or postgresql:// for the Vercel/Neon production setup");
  }

  return new PrismaPg(url);
}

const adapter = createPostgresAdapter(connectionString);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
