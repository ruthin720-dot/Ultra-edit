import crypto from "crypto";
import { db } from "@/db";
import { users, projects, media, scenes, renderJobs } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { renderProfile } from "@/lib/utils";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/constants";

let seeding: Promise<void> | null = null;

const rid = () => crypto.randomUUID();
const days = (n: number) => new Date(Date.now() + n * 86400000);
const minsAgo = (m: number) => new Date(Date.now() - m * 60000);

export { DEMO_EMAIL, DEMO_PASSWORD };

async function seedOnce() {
  const user = {
    id: rid(),
    name: "Maya Okafor",
    email: DEMO_EMAIL,
    passwordHash: hashPassword(DEMO_PASSWORD),
    role: "Senior Editor",
    accent: "#FF6D2E",
    defaultResolution: "1080p",
    defaultFps: 30,
    defaultFormat: "H.264 MP4",
    notifyRenders: true,
    notifyReviews: true,
    notifyMentions: true,
  };
  await db.insert(users).values(user);

  const P = [
    {
      id: rid(), title: "Aurora — Launch Film", client: "Aurora Energy",
      status: "in_review", priority: "high", durationSec: 54, deadline: days(3),
      description: "60s brand film for the Aurora grid-launch keynote. Client wants a tighter rhythm in act two and the end card held 2s longer.",
      coverImg: "/thumbs/product.jpg", coverColor: "gold", createdAt: minsAgo(60 * 26), updatedAt: minsAgo(35),
    },
    {
      id: rid(), title: "Wedding — Naomi & Jules", client: "Private client",
      status: "in_review", priority: "medium", durationSec: 320, deadline: days(7),
      description: "Feature cut for Saturday's reception. Vows and first dance locked; highlight reel still rough.",
      coverImg: "/thumbs/wedding.jpg", coverColor: "rose", createdAt: minsAgo(60 * 24 * 4), updatedAt: minsAgo(60 * 3),
    },
    {
      id: rid(), title: "Neon District (Music Video)", client: "KØDA Records",
      status: "draft", priority: "high", durationSec: 214, deadline: days(12),
      description: "3.5min music video. Beat-sync cut pass in progress; stage rig wide shots need speed ramping.",
      coverImg: "/thumbs/music.jpg", coverColor: "ember", createdAt: minsAgo(60 * 24 * 9), updatedAt: minsAgo(60 * 20),
    },
    {
      id: rid(), title: "Salt & Smoke — S2 E4", client: "Harbor TV",
      status: "locked", priority: "high", durationSec: 2700, deadline: days(5),
      description: "45-min docuseries episode. Picture lock with network; only audio QC outstanding.",
      coverImg: "/thumbs/doc.jpg", coverColor: "tide", createdAt: minsAgo(60 * 24 * 16), updatedAt: minsAgo(60 * 49),
    },
    {
      id: rid(), title: "Tokyo Drift 24", client: "Atlas Magazine",
      status: "delivered", priority: "low", durationSec: 720, deadline: days(-2),
      description: "12-min travelogue. Delivered to editorial; archive the project next week.",
      coverImg: "/thumbs/travel.jpg", coverColor: "slate", createdAt: minsAgo(60 * 24 * 30), updatedAt: minsAgo(60 * 24 * 2),
    },
    {
      id: rid(), title: "Downtown Aerials Reel", client: "EditBay Originals",
      status: "draft", priority: "medium", durationSec: 150, deadline: days(20),
      description: "Showreel of 4K aerial passes for the studio portfolio page.",
      coverImg: "/thumbs/city.jpg", coverColor: "moss", createdAt: minsAgo(60 * 24 * 6), updatedAt: minsAgo(60 * 12),
    },
  ];
  await db.insert(projects).values(P.map((p) => ({ ...p, ownerId: user.id })));
  const [aurora, wedding, neon, salt, , aerials] = P;

  const M = [
    { id: rid(), projectId: aurora.id, name: "A012_C014_hero.MP4", type: "video", durationSec: 34, sizeMB: 1248, tags: "camera-a,hero", thumb: "/thumbs/product.jpg", createdAt: minsAgo(60 * 25) },
    { id: rid(), projectId: aurora.id, name: "A012_C021_orbit.MP4", type: "video", durationSec: 28, sizeMB: 982, tags: "turntable,studio", createdAt: minsAgo(60 * 25) },
    { id: rid(), projectId: aurora.id, name: "sting_04_FINAL.wav", type: "audio", durationSec: 12, sizeMB: 0.4, tags: "sting,music", createdAt: minsAgo(60 * 24) },
    { id: rid(), projectId: aurora.id, name: "score_v3_master.wav", type: "audio", durationSec: 54, sizeMB: 5.1, tags: "score,music", createdAt: minsAgo(60 * 24) },
    { id: rid(), projectId: aurora.id, name: "hero_still_02.png", type: "image", durationSec: 0, sizeMB: 18, tags: "stills", thumb: "/thumbs/product.jpg", createdAt: minsAgo(60 * 24) },
    { id: rid(), projectId: wedding.id, name: "ceremony_cam_b_012.MOV", type: "video", durationSec: 182, sizeMB: 4210, tags: "ceremony,cam-b", thumb: "/thumbs/wedding.jpg", createdAt: minsAgo(60 * 24 * 3) },
    { id: rid(), projectId: wedding.id, name: "WED_BTS_041.mov", type: "video", durationSec: 51, sizeMB: 1480, tags: "bts", thumb: "/thumbs/wedding.jpg", createdAt: minsAgo(60 * 24 * 3) },
    { id: rid(), projectId: wedding.id, name: "jules_vows.wav", type: "audio", durationSec: 42, sizeMB: 0.8, tags: "audio,ceremony", createdAt: minsAgo(60 * 24 * 3) },
    { id: rid(), projectId: neon.id, name: "koda_take_07.MP4", type: "video", durationSec: 66, sizeMB: 2310, tags: "performance", thumb: "/thumbs/music.jpg", createdAt: minsAgo(60 * 24 * 8) },
    { id: rid(), projectId: neon.id, name: "stage_rig_wide.MP4", type: "video", durationSec: 44, sizeMB: 1620, tags: "wide,stage", thumb: "/thumbs/music.jpg", createdAt: minsAgo(60 * 24 * 8) },
    { id: rid(), projectId: salt.id, name: "SMK_E4_INT_kitchen.MP4", type: "video", durationSec: 128, sizeMB: 5240, tags: "int,scene-14", thumb: "/thumbs/doc.jpg", createdAt: minsAgo(60 * 24 * 14) },
    { id: rid(), projectId: salt.id, name: "int_chef_master.wav", type: "audio", durationSec: 302, sizeMB: 3.4, tags: "interview", createdAt: minsAgo(60 * 24 * 14) },
    { id: rid(), projectId: aerials.id, name: "DRN_0231_downtown.MP4", type: "video", durationSec: 96, sizeMB: 3120, tags: "aerial", thumb: "/thumbs/city.jpg", createdAt: minsAgo(30) },
  ];
  await db.insert(media).values(
    M.map((m) => ({ ...m, ownerId: user.id, status: "ready", source: "upload" }))
  );
  const [hero, orbit, sting, score, , ceremony, bts, vows, koda, rig, kitchen, chef] = M;
  await db.insert(media).values({
    id: rid(), ownerId: user.id, projectId: neon.id, name: "upload_neon_fix_v2.MP4",
    type: "video", durationSec: 0, sizeMB: 0, status: "processing", tags: "fixes",
    source: "upload", createdAt: new Date(Date.now() - 4 * 60000),
  });

  const S = (
    projectId: string, title: string, mediaId: string | null, sort: number,
    inSec: number, outSec: number, track: string, color: string, notes = ""
  ) => ({
    id: rid(), ownerId: user.id, projectId, title, mediaId, sort, inSec, outSec, track, color, notes,
  });
  await db.insert(scenes).values([
    S(aurora.id, "Hero open", hero.id, 0, 0, 12, "V1", "ember", "Hold the drift 1f longer on cut 1."),
    S(aurora.id, "Product orbit", orbit.id, 1, 4, 22, "V1", "gold"),
    S(aurora.id, "Grid cutaways", hero.id, 2, 20, 34, "V1", "tide", "Client wants these 10% faster."),
    S(aurora.id, "End card", hero.id, 3, 0, 8, "V1", "slate", "Hold logo 2s per client note."),
    S(aurora.id, "Score — master", score.id, 0, 0, 54, "A1", "moss"),
    S(aurora.id, "Logo sting", sting.id, 1, 0, 6, "A1", "rose"),
    S(wedding.id, "Ceremony — vows", ceremony.id, 0, 0, 48, "V1", "rose"),
    S(wedding.id, "First look", bts.id, 1, 2, 20, "V1", "gold"),
    S(wedding.id, "First dance", ceremony.id, 2, 120, 182, "V1", "ember"),
    S(wedding.id, "Vows audio bed", vows.id, 0, 0, 42, "A1", "moss"),
    S(neon.id, "Verse 1 — performance", koda.id, 0, 0, 32, "V1", "ember"),
    S(neon.id, "Stage rig wide", rig.id, 1, 0, 24, "V1", "tide"),
    S(neon.id, "Chorus — speed ramps", koda.id, 2, 32, 66, "V1", "rose", "Ramps on 8th notes."),
    S(salt.id, "Scene 14 — kitchen", kitchen.id, 0, 0, 128, "V1", "tide"),
    S(salt.id, "Chef interview", chef.id, 0, 0, 120, "A1", "moss"),
    S(aerials.id, "Downtown pass", null, 0, 0, 30, "V1", "moss"),
  ]);

  const J = (
    projectId: string, format: string, resolution: string, fps: number,
    status: string, createdAt: Date, durationSec: number
  ) => {
    const id = rid();
    return {
      id, ownerId: user.id, projectId, format, resolution, fps, status,
      progress: status === "completed" ? 100 : 0,
      durationSec,
      fileSizeMB: Math.round(renderProfile(id, durationSec, resolution, format).sizeMB),
      createdAt,
      completedAt: status === "completed" ? minsAgo(10) : null,
    };
  };
  await db.insert(renderJobs).values([
    J(aurora.id, "H.264 MP4", "4K UHD", 24, "completed", minsAgo(38), 54),
    J(wedding.id, "H.264 MP4", "1080p", 30, "rendering", new Date(Date.now() - 20000), 320),
    J(neon.id, "ProRes 422 MOV", "4K UHD", 24, "queued", new Date(Date.now() - 1200), 214),
    J(salt.id, "HEVC MP4", "1080p", 25, "failed", minsAgo(60 * 5), 2700),
  ]);
}

export async function ensureSeeded() {
  if (!seeding) {
    seeding = (async () => {
      try {
        const [row] = await db
          .select({ id: users.id })
          .from(users)
          .limit(1);
        if (!row) await seedOnce();
      } catch (e) {
        seeding = null; // allow retry (e.g. tables not pushed yet)
        throw e;
      }
    })();
  }
  return seeding;
}
