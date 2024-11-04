import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { nanoid } from "nanoid";
import { db, getDatabase } from "../db";
import { domains, userDomainRelation, users } from "../db/schema";
import type { THono } from "../types";
import { id } from "../utils/id";
import { hash } from "../utils/password";

const app = new Hono<THono>();

app.get("/", async (c) => {
  const payload = c.get("jwt");

  if (!payload) {
    throw new HTTPException(401);
  }

  const db = await getDatabase(c);
  const results = await db
    .select()
    .from(userDomainRelation)
    .where(eq(userDomainRelation.userId, payload.sub))
    .leftJoin(domains, eq(userDomainRelation.domainId, domains.id));

  return c.json(
    results
      .filter(({ domains }) => !!domains)
      .map(({ domains }) => ({
        id: domains?.id,
        name: domains?.name,
      })),
  );
});

app.get("/:domain", async (c) => {
  const payload = c.get("jwt");

  if (!payload) {
    throw new HTTPException(401);
  }

  const domainName = c.req.param("domain");

  const db = await getDatabase(c);
  const [domain] = await db
    .select()
    .from(domains)
    .innerJoin(
      userDomainRelation,
      and(
        eq(domains.name, domainName),
        eq(userDomainRelation.domainId, domains.id),
        eq(userDomainRelation.userId, payload.sub),
      ),
    )
    .limit(1);

  if (!domain) {
    return c.json({ message: "Not found" }, 404);
  }

  return c.json({
    ...domain.domains,
    hasExceededLimit: false,
  });
});

app.post("/", async (c) => {
  const payload = c.get("jwt");

  if (!payload) {
    throw new HTTPException(401);
  }

  const body = await c.req.json<{
    name: string;
  }>();

  const db = await getDatabase(c);
  const domain = await db.transaction(async (tx) => {
    const [domain] = await tx
      .insert(domains)
      .values({
        id: id(),
        name: body.name,
      })
      .returning();

    await db
      .insert(userDomainRelation)
      .values({ id: id(), userId: payload.sub, domainId: domain.id });

    return domain;
  });

  return c.json(domain, 201);
});

export default app;
