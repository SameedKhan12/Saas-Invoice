import { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, integer, pgEnum,jsonb } from "drizzle-orm/pg-core";

export const invoicesStatusEnum = pgEnum("status", ["draft", "pending", "paid", "overdue"]);

export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
}

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  stripeAccountId: text("stripe_account_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  description: text("description"),
  items: jsonb("items").$type<InvoiceItem[]>().default([]),  // ← add this
  amount_cents: integer("amount_cents").notNull(),  // keep as the computed total in cents
  dueDate: timestamp("due_date"),
  status: invoicesStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(()=> new Date()),
})

export type Invoice = InferSelectModel<typeof invoices>
export type Clients = InferSelectModel<typeof clients>