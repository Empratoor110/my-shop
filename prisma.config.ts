import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "postgresql://neondb_owner:npg_GmHp68reIcgq@ep-misty-shape-asllqu5n.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  },
});