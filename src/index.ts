import { Hono } from "hono";
import hello from "./routes/hello";

const app = new Hono();

app.route("/hello", hello);

export default app;
