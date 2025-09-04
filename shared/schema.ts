import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantTransactionId: text("merchant_transaction_id").notNull().unique(),
  amount: integer("amount").notNull(), // amount in paise
  description: text("description").notNull(),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, success, failed
  phonepeTransactionId: text("phonepe_transaction_id"),
  paymentMethod: text("payment_method"), // UPI, CARD, NETBANKING, etc
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  utms: text("utms"), // store JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  merchantTransactionId: z.string().optional(), // Optional, we generate this on the server
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  email: true,
  utms: true,
}).extend({
  email: z.string().email("Invalid email"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
