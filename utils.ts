export const GRADIENTS: Record<string, string> = {
  ember: "linear-gradient(135deg,#FF7A2E 0%,#C2410C 55%,#63220C 100%)",
  tide: "linear-gradient(135deg,#2DD4BF 0%,#0F766E 60%,#123B39 100%)",
  moss: "linear-gradient(135deg,#A3E635 0%,#4D7C0F 60%,#1C2E08 100%)",
  rose: "linear-gradient(135deg,#FB7185 0%,#9F1239 60%,#470B1E 100%)",
  gold: "linear-gradient(135deg,#FBBF24 0%,#B45309 60%,#401A04 100%)",
  slate: "linear-gradient(135deg,#64748B 0%,#334155 60%,#111827 100%)",
};

export const SCENE_COLORS: Record<string, string> = {
  ember: "#FF6D2E",
  tide: "#2DD4BF",
  moss: "#A3E635",
  rose: "#FB7185",
  gold: "#FBBF24",
  slate: "#8B98AB",
};

export const SCENE_COLOR_KEYS = Object.keys(SCENE_COLORS);

export const STATUS_META: Record<
  string,
  { label: string; dot: string; chip: string }
> = {
  draft: {
    label: "Draft",
    dot: "bg-slate-400",
    chip: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  },
  in_review: {
    label: "In Review",
    dot: "bg-amber-400",
    chip: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  },
  locked: {
    label: "Locked",
    dot: "bg-accent",
    chip: "bg-accent/10 text-accent-soft border-accent/25",
  },
  delivered: {
    label: "Delivered",
    dot: "bg-emerald-400",
    chip: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  },
};

export const PRIORITY_META: Record<string, { label: string; cls: string }> = {
  low: { label: "Low", cls: "text-slate-400" },
  medium: { label: "Medium", cls: "text-amber-300" },
  high: { label: "High", cls: "text-rose-300" },
};

export function hashNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function fmtDur(sec: number): string {
  if (!sec || sec < 0) sec = 0;
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function fmtTC(sec: number, fps = 24): string {
  if (!sec || sec < 0) sec = 0;
  const f = Math.floor((sec % 1) * fps);
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(r)}:${pad(f)}`;
}

export function fmtSize(mb: number): string {
  if (!mb && mb !== 0) return "—";
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb < 1) return `${Math.round(mb * 1024)} KB`;
  return `${Math.round(mb)} MB`;
}

export function deadlineLabel(iso: string | null): { text: string; tone: string } {
  if (!iso) return { text: "No deadline", tone: "text-mist" };
  const d = new Date(iso);
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (days < 0)
    return { text: `${Math.abs(days)}d overdue`, tone: "text-rose-300" };
  if (days === 0) return { text: "Due today", tone: "text-amber-300" };
  if (days === 1) return { text: "Due tomorrow", tone: "text-amber-300" };
  if (days <= 5) return { text: `Due in ${days}d`, tone: "text-amber-300" };
  return { text: `Due in ${days}d`, tone: "text-mist" };
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Deterministic fake render timing/size so progress feels consistent across polls. */
export function renderProfile(
  id: string,
  durationSec: number,
  resolution: string,
  format: string
) {
  const h = hashNum(id);
  const etaSec = 16 + (h % 16) + Math.min(20, durationSec / 45);
  const sizeMB =
    durationSec * (resolution === "4K UHD" ? 42 : 13) * (format.includes("ProRes") ? 2.4 : 1);
  return { etaSec, sizeMB: Math.round(sizeMB) };
}

export interface DerivedJob {
  status: string;
  progress: number;
  completedAt: Date | null;
}

/** Derive a job's live progress from elapsed time since it was queued. */
export function deriveJob(
  job: {
    id: string;
    status: string;
    progress: number;
    createdAt: Date;
    durationSec: number;
    resolution: string;
    format: string;
    fileSizeMB: number;
    completedAt: Date | null;
  },
  now = new Date()
): DerivedJob {
  if (job.status === "failed" || job.status === "completed") {
    return { status: job.status, progress: job.status === "completed" ? 100 : job.progress, completedAt: job.completedAt };
  }
  const { etaSec } = renderProfile(job.id, job.durationSec, job.resolution, job.format);
  const elapsed = (now.getTime() - job.createdAt.getTime()) / 1000;
  if (elapsed < 3) {
    return { status: "queued", progress: Math.min(4, (elapsed / 3) * 4), completedAt: null };
  }
  const p = 4 + ((elapsed - 3) / etaSec) * 96;
  if (p >= 100) {
    return {
      status: "completed",
      progress: 100,
      completedAt: new Date(job.createdAt.getTime() + (3 + etaSec) * 1000),
    };
  }
  return { status: "rendering", progress: p, completedAt: null };
}

/** Media items flip from processing to ready after ~22s. */
export function deriveMediaStatus(
  item: { status: string; createdAt: Date },
  now = new Date()
) {
  if (item.status === "processing" && (now.getTime() - item.createdAt.getTime()) / 1000 > 22) {
    return "ready";
  }
  return item.status;
}
