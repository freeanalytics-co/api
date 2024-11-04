import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  out: "drizzle",
  schema: "src/db/schema.ts",
  dbCredentials: {
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    port: 5432,
    user: process.env.POSTGRES_USER || "freeanalytics",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_DB || "freeanalytics",
    ssl: false,
  },
});
