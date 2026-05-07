import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

function createMariaDbAdapter(url: string) {
  const databaseUrl = new URL(url);
  if (databaseUrl.protocol !== "mysql:" && databaseUrl.protocol !== "mariadb:") {
    console.warn("DATABASE_URL should start with mysql:// or mariadb:// for the MySQL/MariaDB MVP");
  }

  return new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 3306),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    ssl: false,
  });
}

const adapter = createMariaDbAdapter(connectionString);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
