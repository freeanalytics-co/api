import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import type { MiddlewareHandler } from "hono/types";
import { z } from "zod";
import type { THono } from "../types";

function getToken(c: Context<THono, string>) {
  const cookie = getCookie(c, "penkle-token");

  if (cookie) {
    return cookie;
  }

  const header = c.req.raw.headers.get("Authorization");

  if (!header) {
    return null;
  }

  const parts = header.split(" ");
  return parts.length === 2 ? parts[1] : null;
}

export function jwt(): MiddlewareHandler {
  return async function jwt(c: Context<THono, string>, next) {
    const token = getToken(c);

    if (token) {
      try {
        const payload = await verify(token, c.env.JWT_SECRET);

        const { data, success } = z
          .object({
            sub: z.string(),
            email: z.string().email(),
          })
          .safeParse(payload);

        if (success) {
          c.set("jwt", data);
        } else {
          c.set("jwt", null);
        }
      } catch (e) {}
    } else {
      c.set("jwt", null);
    }

    await next();
  };
}
