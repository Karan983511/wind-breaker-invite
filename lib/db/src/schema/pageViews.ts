import { pgTable, integer } from "drizzle-orm/pg-core";

export const pageViewsTable = pgTable("page_views", {
  id: integer("id").primaryKey().default(1),
  count: integer("count").notNull().default(0),
});

export type PageViews = typeof pageViewsTable.$inferSelect;
