import crypto from "crypto";
import { cookies } from "next/headers";
import { eq, and, gte } from "drizzle-orm";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";

const COOKIE = "editbay_session";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return check.length === expected.length && crypto.timingSafeEqual(check, expected);
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 86400 * 1000);
  await db.insert(sessions).values({ id: token, userId, expiresAt: expires, createdAt: new Date() });
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    try {
      await db.delete(sessions).where(eq(sessions.id, token));
    } catch {
      /* table may not exist yet during early bootstrap */
    }
  }
  store.delete(COOKIE);
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accent: string;
  defaultResolution: string;
  defaultFps: number;
  defaultFormat: string;
  notifyRenders: boolean;
  notifyReviews: boolean;
  notifyMentions: boolean;
}

export function publicUser(u: typeof users.$inferSelect): SafeUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    accent: u.accent,
    defaultResolution: u.defaultResolution,
    defaultFps: u.defaultFps,
    defaultFormat: u.defaultFormat,
    notifyRenders: u.notifyRenders,
    notifyReviews: u.notifyReviews,
    notifyMentions: u.notifyMentions,
  };
}

export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return null;
    const rows = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, token), gte(sessions.expiresAt, new Date())));
    const row = rows[0];
    if (!row) return null;
    return publicUser(row.user);
  } catch {
    return null;
  }
}
