export type ProjectStatus = "draft" | "in_review" | "locked" | "delivered";
export type Priority = "low" | "medium" | "high";
export type MediaKind = "video" | "audio" | "image";
export type JobStatus = "queued" | "rendering" | "completed" | "failed";
export type Track = "V2" | "V1" | "A1";

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  client: string;
  status: ProjectStatus;
  priority: Priority;
  durationSec: number;
  deadline: string | null;
  description: string;
  coverImg: string | null;
  coverColor: string;
  createdAt: string;
  updatedAt: string;
  sceneCount?: number;
  mediaCount?: number;
}

export interface MediaItem {
  id: string;
  ownerId: string;
  projectId: string | null;
  projectTitle?: string | null;
  name: string;
  type: MediaKind;
  durationSec: number;
  sizeMB: number;
  status: string;
  tags: string;
  thumb: string | null;
  source: string;
  createdAt: string;
}

export interface Scene {
  id: string;
  projectId: string;
  title: string;
  mediaId: string | null;
  mediaName?: string | null;
  mediaType?: string | null;
  mediaDurationSec?: number | null;
  sort: number;
  inSec: number;
  outSec: number;
  track: Track;
  color: string;
  notes: string;
  createdAt: string;
}

export interface ExportJob {
  id: string;
  ownerId: string;
  projectId: string;
  projectTitle?: string | null;
  format: string;
  resolution: string;
  fps: number;
  status: JobStatus;
  progress: number;
  durationSec: number;
  fileSizeMB: number;
  createdAt: string;
  completedAt: string | null;
}

export interface Overview {
  activeProjects: number;
  inReview: number;
  activeRenders: number;
  storageMB: number;
  mediaCount: number;
  recentProjects: Project[];
  deadlines: Project[];
  activeExports: ExportJob[];
}
