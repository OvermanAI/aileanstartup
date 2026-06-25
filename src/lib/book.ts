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
};

// ── 全書 canonical 結構（即使尚未撰寫，目錄也顯示全貌）──
export const STAGES: StageMeta[] = [
  { n: 1, theme: "第一部", title: "AI 一人公司", blurb: "你 + Agent 軍團 = 一個人等於一家公司" },
  { n: 2, theme: "第二部", title: "AI MVP · 極速上市", blurb: "第一天就上市，先賣再做" },
  { n: 3, theme: "第三部", title: "AI BML · 自動化迭代", blurb: "用 Agent 跑 Build-Measure-Learn，越跑越準" },
  { n: 4, theme: "第四部", title: "AI PMF · 創業關鍵任務", blurb: "找到市場真正要的，打造自動印鈔機" },
];

type Canon = { slug: string; stage: number; chapter: number; title: string; summary: string };

export const CANON: Canon[] = [
  { slug: "intro", stage: 0, chapter: 0, title: "前言：吃下 AI 的紅藥丸", summary: "AI 精實創業是作弊碼——讓你直接跳過不需要過的關卡。" },
  { slug: "ch01", stage: 1, chapter: 1, title: "我的 AI 一人公司", summary: "10 倍收入不靠更努力，靠換掉天花板：用系統取代你一個人的上限。" },
  { slug: "ch02", stage: 1, chapter: 2, title: "Agent，你的超級員工", summary: "Agent 是第一天就能上工、不累、不抱怨的執行團隊。" },
  { slug: "ch03", stage: 1, chapter: 3, title: "精實創業：為你的 Agent 加上創業技能", summary: "把精實創業方法裝進 Agent，讓它替你找到會賺錢的題目。" },
  { slug: "ch04", stage: 2, chapter: 4, title: "第一天就上市（MVP）", summary: "先賣再做，讓市場告訴你要不要繼續——這是最重要的一條規則。" },
  { slug: "ch05", stage: 2, chapter: 5, title: "用 Agent 免費做出產品", summary: "啟動成本近乎零：用 Agent 一週做出第一個能賣的版本。" },
  { slug: "ch06", stage: 2, chapter: 6, title: "一次 10 個 MVP 測試市場", summary: "不押注一個想法；同時丟 10 個 MVP，讓數據選出贏家。" },
  { slug: "ch07", stage: 3, chapter: 7, title: "你是 AI 的老闆", summary: "你出判斷與方向，Agent 出執行——你思考一次，它執行一百次。" },
  { slug: "ch08", stage: 3, chapter: 8, title: "放手讓 Agent 工作", summary: "Just Agent It：把整包工作交出去，不手癢插手改成果。" },
  { slug: "ch09", stage: 3, chapter: 9, title: "自主迭代優化的聖杯", summary: "讓 Agent 自己評估、自己修正——系統開始自動變強。" },
  { slug: "ch10", stage: 4, chapter: 10, title: "直接向客戶收錢", summary: "PMF 的訊號只有一個：陌生人願意付錢。先收錢，再放大。" },
  { slug: "ch11", stage: 4, chapter: 11, title: "用 Agent 幫你賺錢", summary: "把獲客、成交、交付一條條變成 Agent 工作流，自動跑。" },
  { slug: "ch12", stage: 4, chapter: 12, title: "打造一台自動印鈔機", summary: "找到那條值得放大的路，讓系統 24/7 全速去跑。" },
];

const CONTENT_DIR = path.join(process.cwd(), "content", "book");

function fmtDate(v: unknown): string | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function readFileFor(slug: string): { data: Record<string, unknown>; content: string } | null {
  for (const ext of [".mdx", ".md"]) {
    const p = path.join(CONTENT_DIR, slug + ext);
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf8");
      const { data, content } = matter(raw);
      return { data, content };
    }
  }
  return null;
}

export function getChapters(): ChapterMeta[] {
  return CANON.map((c, i) => {
    const file = readFileFor(c.slug);
    const data = (file?.data ?? {}) as Record<string, unknown>;
    const status = (data.status as ChapterStatus) ?? (file ? "drafting" : "planned");
    return {
      slug: c.slug,
      stage: c.stage,
      chapter: c.chapter,
      order: i,
      title: (data.title as string) ?? c.title,
      summary: (data.summary as string) ?? c.summary,
      status,
      updated: fmtDate(data.updated),
      hasContent: Boolean(file),
    };
  });
}

export function getChapter(slug: string): { meta: ChapterMeta; content: string } | null {
  const chapters = getChapters();
  const meta = chapters.find((c) => c.slug === slug);
  if (!meta) return null;
  const file = readFileFor(slug);
  return { meta, content: file?.content ?? "" };
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
