import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";

export const pageViewsTable = pgTable("page_views", {
  id: integer("id").primaryKey().default(1),
  count: integer("count").notNull().default(0),
});

export const visitorLogTable = pgTable("visitor_log", {
  ip: text("ip").primaryKey(),
  lastSeen: timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
});

export type PageViews = typeof pageViewsTable.$inferSelect;
export type VisitorLog = typeof visitorLogTable.$inferSelect;
