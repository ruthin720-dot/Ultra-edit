import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("Editor"),
  accent: text("accent").notNull().default("#FF6D2E"),
  defaultResolution: text("default_resolution").notNull().default("1080p"),
  defaultFps: integer("default_fps").notNull().default(30),
  defaultFormat: text("default_format").notNull().default("H.264 MP4"),
  notifyRenders: boolean("notify_renders").notNull().default(true),
  notifyReviews: boolean("notify_reviews").notNull().default(true),
  notifyMentions: boolean("notify_mentions").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  client: text("client").notNull().default(""),
  status: text("status").notNull().default("draft"), // draft | in_review | locked | delivered
  priority: text("priority").notNull().default("medium"), // low | medium | high
  durationSec: integer("duration_sec").notNull().default(0),
  deadline: timestamp("deadline", { withTimezone: true }),
  description: text("description").notNull().default(""),
  coverImg: text("cover_img"), // path in /public or null
  coverColor: text("cover_color").notNull().default("ember"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  type: text("type").notNull().default("video"), // video | audio | image
  durationSec: integer("duration_sec").notNull().default(0),
  sizeMB: real("size_mb").notNull().default(0),
  status: text("status").notNull().default("processing"), // processing | ready
  tags: text("tags").notNull().default(""),
  thumb: text("thumb"),
  source: text("source").notNull().default("upload"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const scenes = pgTable("scenes", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  mediaId: text("media_id").references(() => media.id, {
    onDelete: "set null",
  }),
  sort: integer("sort").notNull().default(0),
  inSec: real("in_sec").notNull().default(0),
  outSec: real("out_sec").notNull().default(0),
  track: text("track").notNull().default("V1"), // V2 | V1 | A1
  color: text("color").notNull().default("ember"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const renderJobs = pgTable("render_jobs", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  format: text("format").notNull().default("H.264 MP4"),
  resolution: text("resolution").notNull().default("1080p"),
  fps: integer("fps").notNull().default(30),
  status: text("status").notNull().default("queued"), // queued | rendering | completed | failed
  progress: real("progress").notNull().default(0),
  durationSec: integer("duration_sec").notNull().default(0),
  fileSizeMB: real("file_size_mb").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
