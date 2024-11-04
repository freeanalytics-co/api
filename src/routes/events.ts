import { Hono } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";
import { UAParser } from "ua-parser-js";
import { geo } from "../lib/geo";
import type { THono } from "../types";
import { res } from "../utils/res";

const app = new Hono<THono>();

app.post("/", async (c) => {
  const body = await c.req.json<{
    h: string;
    d: string;
    r?: string;
  }>();

  if (res(() => new URL(body.h).host !== body.d)) {
    return c.json({ message: "Domains do not match" }, 400);
  }

  const ua = c.req.header("User-Agent");
  const conn = getConnInfo(c);
  const ip = conn.remote.address;
  const coords = ip ? geo(ip) : null;
  const parsed = UAParser(ua);
  const device: "Mobile" | "Tablet" | "Desktop" =
    parsed.device.type === "mobile"
      ? "Mobile"
      : parsed.device.type === "tablet"
        ? "Tablet"
        : "Desktop";

  let url: URL | null;

  if (body.h.endsWith("/")) {
    url = res(() => new URL(body.h.slice(0, -1)));
  } else {
    url = res(() => new URL(body.h));
  }

  if (!url) {
    return;
  }

  const payload: Record<string, string | null> = {};

  payload.utmSource = c.req.query("utm_source") ?? null;
  payload.utmMedium = c.req.query("utm_medium") ?? null;
  payload.utmCampaign = c.req.query("utm_campaign") ?? null;
  payload.utmTerm = c.req.query("utm_term") ?? null;
  payload.utmContent = c.req.query("utm_content") ?? null;
  payload.source = c.req.query("source") ?? null;
  payload.ref = c.req.query("ref") ?? null;

  return c.json({ ua, ip });
});

export default app;
