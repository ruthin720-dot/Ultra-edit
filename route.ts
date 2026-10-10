import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { scenes } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Not signed in." }, { status: 401 });
  try {
    const b = (await req.json()) as { id?: string; dir?: number };
    const id = String(b.id ?? "");
    const dir = b.dir === -1 ? -1 : 1;
    const [target] = await db
      .select()
      .from(scenes)
      .where(and(eq(scenes.id, id), eq(scenes.ownerId, user.id)))
      .limit(1);
    if (!target) return Response.json({ error: "Scene not found." }, { status: 404 });

    const siblings = await db
      .select()
      .from(scenes)
      .where(and(eq(scenes.projectId, target.projectId), eq(scenes.ownerId, user.id)))
      .orderBy(asc(scenes.sort), asc(scenes.createdAt));
    const idx = siblings.findIndex((s) => s.id === target.id);
    const other = siblings[idx + dir];
    if (idx === -1 || !other) return Response.json({ scenes: siblings }, { status: 200 });

    await db.update(scenes).set({ sort: other.sort }).where(eq(scenes.id, target.id));
    await db.update(scenes).set({ sort: target.sort }).where(eq(scenes.id, other.id));

    const updated = await db
      .select()
      .from(scenes)
      .where(and(eq(scenes.projectId, target.projectId), eq(scenes.ownerId, user.id)))
      .orderBy(asc(scenes.sort), asc(scenes.createdAt));
    return Response.json({ scenes: updated });
  } catch {
    return Response.json({ error: "Could not reorder scenes." }, { status: 500 });
  }
}
