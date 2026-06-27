import Link from "next/link";
import type { Metadata } from "next";
import { getBuildLog } from "@/lib/book";

export const metadata: Metadata = {
  title: "建造日誌",
  description:
    "AI LEAN STARTUP 公開寫作的建造日誌——每一次新增與修訂，日期 + 改了什麼，全部攤開。",
};

export default function BuildLog() {
  const log = getBuildLog();

  // 依日期分組（反時序）
  const byDate = new Map<string, typeof log>();
  for (const e of log) {
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date)!.push(e);
  }

  return (
    <div className="py-14">
      <p className="eyebrow">建造日誌 · Build Log</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--fg-strong)]">
        這本書怎麼長出來的
      </h1>
      <p className="mt-3 max-w-[var(--reading)] text-[var(--muted)]">
        公開寫作的意思是：連「改了什麼」都攤開。下面是全書每一次新增與修訂，
        最新在上。每一條都連到它改動的那一章。
      </p>

      {log.length === 0 ? (
        <div className="mt-12 rounded-[var(--radius)] border border-dashed border-[var(--line-strong)] p-10 text-center text-[var(--muted)]">
          <p className="text-lg font-medium text-[var(--fg-strong)]">日誌從今天開始累積</p>
          <p className="mt-2">之後每一次新增與修訂，都會留下一筆「日期 + 改了什麼」。</p>
        </div>
      ) : (
        <div className="mt-12 space-y-10">
          {[...byDate.entries()].map(([date, entries]) => (
            <section key={date}>
              <div className="flex items-baseline gap-3 border-b border-[var(--line-strong)] pb-2">
                <span className="font-mono text-sm tabular-nums text-[var(--accent-ink)]">
                  {date}
                </span>
                <span className="text-xs text-[var(--metal)]">
                  {entries.length} 筆
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                {entries.map((e, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Link
                      href={`/book/${e.slug}`}
                      className="shrink-0 font-mono text-xs text-[var(--metal)] hover:text-[var(--accent-ink)]"
                    >
                      {e.slug}
                    </Link>
                    <div>
                      <span className="text-[var(--fg)]">{e.note}</span>
                      <Link
                        href={`/book/${e.slug}`}
                        className="ml-2 text-[var(--muted)] hover:text-[var(--accent-ink)]"
                      >
                        — {e.title}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-14 flex items-center gap-2 text-xs text-[var(--metal)]">
        <span className="live-mark" />
        <span className="eyebrow">Writing in Public</span>
      </p>
    </div>
  );
}
