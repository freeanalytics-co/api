import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "./middleware/jwt";
import auth from "./routes/auth";
import domains from "./routes/domains";
import events from "./routes/events";
import type { THono } from "./types";

const app = new Hono<THono>();

app.use(jwt());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

app.route("/auth", auth);
app.route("/domains", domains);
app.route("/events", events);

export default app;
