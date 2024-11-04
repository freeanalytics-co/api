import { sql } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  lastSeenAt: timestamp("last_seen_at", { mode: "date" }).notNull(),

  updatedAt: timestamp("updated_at", { mode: "date" })
    .$onUpdate(() => sql`now()`)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const domains = pgTable("domains", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),

  updatedAt: timestamp("updated_at", { mode: "date" })
    .$onUpdate(() => sql`now()`)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const roleEnum = pgEnum("role", ["owner", "admin", "member"]);

export const userDomainRelation = pgTable("user_domain_relation", {
  id: text("id").primaryKey(),

  role: roleEnum().default("owner"),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  domainId: text("domain_id")
    .references(() => domains.id)
    .notNull(),

  updatedAt: timestamp("updated_at", { mode: "date" })
    .$onUpdate(() => sql`now()`)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
