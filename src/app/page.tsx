import Link from "next/link";
import { getChapters } from "@/lib/book";

const THEMES = [
  {
    n: "AI MVP",
    t: "第一天就上市",
    d: "先賣再做，讓市場告訴你要不要繼續——而不是埋頭做幾個月。",
  },
  {
    n: "AI BML",
    t: "自動化迭代",
    d: "用 Agent 跑 Build-Measure-Learn 循環，每週從數據學習，越跑越準。",
  },
  {
    n: "AI PMF",
    t: "創業關鍵任務",
    d: "找到市場真正要的東西，讓 Agent 系統自動跑、自動放大。",
  },
];

export default function Home() {
  const chapters = getChapters();
  const live = chapters.filter((c) => c.hasContent).length;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="border-b border-[var(--line)] py-16 sm:py-20">
        <p className="flex items-center gap-2">
          <span className="live-mark" />
          <span className="eyebrow">公開寫作中 · Writing in Public</span>
        </p>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--fg-strong)] sm:text-5xl">
          AI LEAN STARTUP
        </h1>
        <p className="mt-3 text-lg text-[var(--muted)]">AI 精實創業</p>

        <p className="prose-zh mt-8 max-w-[var(--reading)] text-lg">
          傳統創業有一套關卡：找人、找錢、等上市、撐過驗證期。
          <strong className="text-[var(--fg-strong)]">
            AI 精實創業是作弊碼——讓你直接跳過不需要過的關卡。
          </strong>
          用 Agent 實踐 <b className="text-[var(--fg-strong)]">AI MVP → AI BML → AI PMF</b>，打造一間真的會賺錢的 AI 一人公司。
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/book"
            className="rounded-[var(--radius)] bg-[var(--fg-strong)] px-6 py-3 text-sm font-medium text-[var(--surface)] transition-opacity hover:opacity-85"
          >
            開始讀（{live} 章已上線）
          </Link>
          <Link
            href="/book/intro"
            className="rounded-[var(--radius)] border border-[var(--line-strong)] px-6 py-3 text-sm font-medium text-[var(--fg)] hover:bg-[var(--surface-2)]"
          >
            從前言開始
          </Link>
        </div>
      </section>

      {/* ── 核心公式：功能規格卡 ── */}
      <section className="py-14">
        <p className="eyebrow">核心公式 · AI MVP → AI BML → AI PMF</p>
        <div className="mt-6 grid border-t border-[var(--line)] sm:grid-cols-3 sm:border-t-0">
          {THEMES.map((x, i) => (
            <div
              key={x.t}
              className={`py-6 sm:px-6 sm:py-2 sm:first:pl-0 ${
                i > 0
                  ? "border-t border-[var(--line)] sm:border-l sm:border-t-0"
                  : ""
              }`}
            >
              <div className="font-mono text-xs text-[var(--metal)]">{x.n}</div>
              <div className="mt-2 font-semibold text-[var(--fg-strong)]">
                {x.t}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {x.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
