import { pgTable, text, serial, integer, boolean, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Status enum for credit score
export const creditScoreStatusEnum = pgEnum('credit_score_status', ['poor', 'fair', 'good', 'very_good', 'excellent']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarInitials: text("avatar_initials").notNull(),
  creditScore: integer("credit_score").default(650),
  creditScoreStatus: creditScoreStatusEnum("credit_score_status").default("fair"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Credit cards table
export const creditCards = pgTable("credit_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  balance: real("balance").notNull(),
  limit: real("limit").notNull(),
  utilization: real("utilization").notNull(),
  isConnected: boolean("is_connected").default(true),
});

// Income data table
export const incomeData = pgTable("income_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  date: timestamp("date").notNull(),
  isExpected: boolean("is_expected").default(false),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'success', 'warning', 'info', etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Action items table
export const actionItems = pgTable("action_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'warning', 'success', 'info', etc.
  actionButton: text("action_button").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Credit score simulations table
export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  baseScore: integer("base_score").notNull(),
  potentialScore: integer("potential_score").notNull(),
  payDownDebt: real("pay_down_debt").default(0),
  newCreditCard: boolean("new_credit_card").default(false),
  onTimePayments: integer("on_time_payments").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define schemas for data insertion
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCreditCardSchema = createInsertSchema(creditCards).omit({ id: true });
export const insertIncomeDataSchema = createInsertSchema(incomeData).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertActionItemSchema = createInsertSchema(actionItems).omit({ id: true, createdAt: true });
export const insertSimulationSchema = createInsertSchema(simulations).omit({ id: true, createdAt: true });

// Define types for insert and select
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>;
export type CreditCard = typeof creditCards.$inferSelect;

export type InsertIncomeData = z.infer<typeof insertIncomeDataSchema>;
export type IncomeData = typeof incomeData.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type ActionItem = typeof actionItems.$inferSelect;

export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type Simulation = typeof simulations.$inferSelect;
