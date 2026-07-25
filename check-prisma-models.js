const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const DATABASE_URL = "postgresql://neondb_owner:npg_GmHp68reIcgq@ep-misty-shape-asllqu5n.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

console.log("مدل‌هایی که Prisma Client می‌شناسه:");
console.log(Object.keys(prisma).filter((k) => !k.startsWith("_") && !k.startsWith("$")));