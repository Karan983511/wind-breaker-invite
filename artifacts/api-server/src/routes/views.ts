import { Router, type IRouter } from "express";
import { GetViewsResponse } from "@workspace/api-zod";
import { db, pageViewsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/views", async (req, res) => {
  try {
    await db
      .insert(pageViewsTable)
      .values({ id: 1, count: 1 })
      .onConflictDoUpdate({
        target: pageViewsTable.id,
        set: { count: sql`${pageViewsTable.count} + 1` },
      });

    const [row] = await db
      .select({ count: pageViewsTable.count })
      .from(pageViewsTable)
      .where(eq(pageViewsTable.id, 1));

    const data = GetViewsResponse.parse({ count: row?.count ?? 0 });
    res.json(data);
  } catch (err) {
    req.log.error(err, "Failed to update view count");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
