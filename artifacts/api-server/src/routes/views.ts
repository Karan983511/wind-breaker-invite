import { Router, type IRouter, type Request } from "express";
import { GetViewsResponse } from "@workspace/api-zod";
import { db, pageViewsTable, visitorLogTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const COOLDOWN_HOURS = 2;

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

router.get("/views", async (req, res) => {
  try {
    const ip = getClientIp(req);
    const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
    const now = new Date();
    const cutoff = new Date(now.getTime() - cooldownMs);

    const [existing] = await db
      .select({ lastSeen: visitorLogTable.lastSeen })
      .from(visitorLogTable)
      .where(eq(visitorLogTable.ip, ip));

    const shouldCount = !existing || existing.lastSeen < cutoff;

    if (shouldCount) {
      await db
        .insert(visitorLogTable)
        .values({ ip, lastSeen: now })
        .onConflictDoUpdate({
          target: visitorLogTable.ip,
          set: { lastSeen: now },
        });

      await db
        .insert(pageViewsTable)
        .values({ id: 1, count: 1 })
        .onConflictDoUpdate({
          target: pageViewsTable.id,
          set: { count: sql`${pageViewsTable.count} + 1` },
        });
    }

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
