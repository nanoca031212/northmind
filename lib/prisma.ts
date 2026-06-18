import { PrismaClient } from "@prisma/client";

function getDatasourceUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("connection_limit=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connection_limit=5`;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: { db: { url: getDatasourceUrl() } },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

globalForPrisma.prisma = prisma;
