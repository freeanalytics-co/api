import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Context } from "hono";
import { Client } from "pg";
import type { THono } from "../types";
import * as schema from "./schema";

config({ path: "../../.dev.vars" });

export async function getDatabase(c: Context<THono, string>) {
  const client = new Client({
    host: c.env.POSTGRES_HOST || "127.0.0.1",
    port: 5432,
    user: c.env.POSTGRES_USER || "freeanalytics",
    password: c.env.POSTGRES_PASSWORD || "password",
    database: c.env.POSTGRES_DB || "freeanalytics",
  });

  await client.connect();

  return drizzle(client, { schema });
}
