import { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import z from "zod";
import { id } from "zod/locales";
export const invoicesStatusEnum = pgEnum("status", ["draft", "pending", "paid", "overdue"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  clientId: uuid("client_id").notNull(),
  amount_cents: integer("amount_cents").notNull(),
  status: invoicesStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
})

export type Invoice = InferSelectModel<typeof invoices>