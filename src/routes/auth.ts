import dayjs from "dayjs";
import { eq, getTableColumns } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { nanoid } from "nanoid";
import { db, getDatabase } from "../db";
import { users } from "../db/schema";
import type { THono } from "../types";
import { id } from "../utils/id";
import { hash } from "../utils/password";

const app = new Hono<THono>();

app.get("/me", async (c) => {
  const payload = c.get("jwt");

  console.log({ payload });

  if (!payload) {
    throw new HTTPException(401);
  }

  const { password, ...select } = getTableColumns(users);

  const db = await getDatabase(c);
  const [user] = await db
    .select(select)
    .from(users)
    .where(eq(users.id, payload.sub));

  console.log({ user });

  return c.json({
    ...user,
    firstName: user.name.split(" ")[0],
    lastName: user.name.split(" ")[1],
  });
});

app.post("/signup", async (c) => {
  const body = await c.req.json<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>();

  if (body.password !== body.confirmPassword) {
    return c.json({ message: "Passwords do not match" }, 400);
  }

  const db = await getDatabase(c);
  const [user] = await db
    .insert(users)
    .values({
      id: id(),
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      password: await hash(body.password),
      lastSeenAt: dayjs().toDate(),
    })
    .returning({
      sub: users.id,
      email: users.email,
    });

  const token = await sign(user, c.env.JWT_SECRET);

  const isProd = false;

  setCookie(c, "penkle-token", token, {
    httpOnly: true,
    secure: isProd,
    domain: isProd ? ".penkle.com" : undefined,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
  });

  return c.json(
    {
      accessToken: token,
    },
    201,
  );
});

export default app;
