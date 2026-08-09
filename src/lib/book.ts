import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ChapterStatus = "planned" | "drafting" | "published";

export type StageMeta = {
  n: number;
  theme: string; // 主題一/二/三
  title: string; // 主題英文名 + 中文
  blurb: string;
};

export type Revision = { date: string; note: string };

/** 子章節＝一篇獨立文章，本書最小的可編輯與可發布單位。 */
export type SectionMeta = {
  chapter: string; // 所屬章目錄，如 "ch01"
  id: string; // 小節編號，如 "1-1"
  title: string;
  idea: string; // 核心觀點，/ideas 頁的來源
  status: ChapterStatus;
  origin: string;
  stage: number;
  hasContent: boolean;
};

export type ChapterMeta = {
  slug: string;
  stage: number;
  chapter: number; // 0 = 前言
  order: number;
  title: string;
  summary: string;
  status: ChapterStatus;
  updated?: string;
  hasContent: boolean;
  revisions?: Revision[]; // 公開修訂紀錄（Writing in Public）
  sections: SectionMeta[];
};

function parseRevisions(v: unknown): Revision[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const list = v
    .map((r) => {
      const o = (r ?? {}) as { date?: unknown; note?: unknown };
      return { date: fmtDate(o.date) ?? "", note: String(o.note ?? "") };
    })
    .filter((r) => r.note);
  return list.length ? list : undefined;
}

// ── 全書 canonical 結構 ──
export const STAGES: StageMeta[] = [
  { n: 1, theme: "第一部", title: "AI 一人公司", blurb: "你 + Agent 軍團 = 一個人等於一家公司" },
  { n: 2, theme: "第二部", title: "AI MVP · 極速上市", blurb: "第一天就上市，先賣再做" },
  { n: 3, theme: "第三部", title: "AI BML · 自動化迭代", blurb: "用 Agent 跑 Build-Measure-Learn，越跑越準" },
  { n: 4, theme: "第四部", title: "AI PMF · 創業關鍵任務", blurb: "找到市場真正要的，打造自動印鈔機" },
];

const CONTENT_DIR = path.join(process.cwd(), "content", "book");

function fmtDate(v: unknown): string | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function readMdx(p: string) {
  if (!fs.existsSync(p)) return null;
  const { data, content } = matter(fs.readFileSync(p, "utf8"));
  return { data: data as Record<string, unknown>, content };
}

/** 小節編號排序：取破折號後的數字，1-2 要排在 1-10 前面。 */
function sectionRank(id: string): number {
  const n = Number(id.split("-")[1]);
  return Number.isFinite(n) ? n : 0;
}

function readSections(dir: string, stage: number): SectionMeta[] {
  const dirPath = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".mdx") && f !== "_index.mdx")
    .map((f) => {
      const file = readMdx(path.join(dirPath, f))!;
      const d = file.data;
      return {
        chapter: dir,
        id: (d.section as string) ?? f.replace(/\.mdx$/, ""),
        title: (d.title as string) ?? "",
        idea: (d.idea as string) ?? "",
        status: (d.status as ChapterStatus) ?? "drafting",
        origin: (d.origin as string) ?? "",
        stage,
        hasContent: file.content.trim().length > 0,
      };
    })
    .sort((a, b) => sectionRank(a.id) - sectionRank(b.id));
}

/** 章的狀態由它的小節推導：全空＝規劃中，有寫＝草稿中，全發布＝已發布。 */
function deriveStatus(sections: SectionMeta[], fallback: ChapterStatus): ChapterStatus {
  if (!sections.length) return fallback;
  if (sections.every((s) => s.status === "planned")) return "planned";
  if (sections.every((s) => s.status === "published")) return "published";
  return "drafting";
}

export function getChapters(): ChapterMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const chapters = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const idx = readMdx(path.join(CONTENT_DIR, e.name, "_index.mdx"));
      const d = (idx?.data ?? {}) as Record<string, unknown>;
      const stage = Number(d.stage ?? 0);
      const sections = readSections(e.name, stage);
      const fallbackStatus: ChapterStatus = idx ? "drafting" : "planned";
      return {
        slug: e.name,
        stage,
        chapter: Number(d.order ?? 0),
        order: 0,
        title: (d.title as string) ?? e.name,
        summary: (d.summary as string) ?? "",
        status: deriveStatus(sections, fallbackStatus),
        updated: fmtDate(d.updated),
        hasContent: Boolean(idx?.content.trim()) || sections.some((s) => s.hasContent),
        revisions: parseRevisions(d.revisions),
        sections,
      } satisfies ChapterMeta;
    })
    .sort((a, b) => a.stage - b.stage || a.chapter - b.chapter);

  chapters.forEach((c, i) => (c.order = i));
  return chapters;
}

export function getChapter(slug: string): { meta: ChapterMeta; content: string } | null {
  const meta = getChapters().find((c) => c.slug === slug);
  if (!meta) return null;
  const idx = readMdx(path.join(CONTENT_DIR, slug, "_index.mdx"));
  return { meta, content: idx?.content ?? "" };
}

export function getSection(
  chapterSlug: string,
  sectionId: string,
): { meta: SectionMeta; chapter: ChapterMeta; content: string } | null {
  const chapter = getChapters().find((c) => c.slug === chapterSlug);
  const meta = chapter?.sections.find((s) => s.id === sectionId);
  if (!chapter || !meta) return null;
  const file = readMdx(path.join(CONTENT_DIR, chapterSlug, `${sectionId}.mdx`));
  return { meta, chapter, content: file?.content ?? "" };
}

/** 全書小節的線性閱讀順序——上一篇／下一篇會跨章。 */
export function getAllSections(): SectionMeta[] {
  return getChapters().flatMap((c) => c.sections);
}

export function sectionNeighbors(chapterSlug: string, sectionId: string) {
  const all = getAllSections();
  const i = all.findIndex((s) => s.chapter === chapterSlug && s.id === sectionId);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}

export function chapterNeighbors(slug: string) {
  const chapters = getChapters();
  const idx = chapters.findIndex((c) => c.slug === slug);
  return {
    prev: idx > 0 ? chapters[idx - 1] : null,
    next: idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null,
  };
}

export const STATUS_LABEL: Record<ChapterStatus, string> = {
  planned: "規劃中",
  drafting: "草稿中",
  published: "已發布",
};

// ── 建造日誌：章的修訂紀錄 ＋ 全書層級的實戰記錄，反時序 ──
export type BuildLogEntry = {
  date: string;
  slug?: string; // 改動的那一章；沒有＝全書層級
  title: string;
  note: string;
  body?: string; // 長篇實戰記錄（Markdown），只有全書層級會有
};

const LOG_DIR = path.join(process.cwd(), "content", "log");

/** 全書層級的實戰記錄：content/log/<日期>-<主題>.md，一個檔一筆。 */
function getSiteLog(): BuildLogEntry[] {
  if (!fs.existsSync(LOG_DIR)) return [];
  return fs
    .readdirSync(LOG_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => {
      const file = readMdx(path.join(LOG_DIR, f))!;
      const d = file.data;
      return {
        date: fmtDate(d.date) ?? "",
        title: (d.title as string) ?? "",
        note: (d.note as string) ?? "",
        body: file.content.trim() || undefined,
      };
    })
    .filter((e) => e.date && e.note);
}

export function getBuildLog(): BuildLogEntry[] {
  const entries: BuildLogEntry[] = getSiteLog();
  for (const c of getChapters()) {
    if (!c.revisions) continue;
    for (const r of c.revisions) {
      entries.push({ date: r.date, slug: c.slug, title: c.title, note: r.note });
    }
  }
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return entries;
}
