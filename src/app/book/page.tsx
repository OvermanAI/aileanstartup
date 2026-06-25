import Link from "next/link";
import type { Metadata } from "next";
import { getChapters, STAGES } from "@/lib/book";
import StatusBadge from "@/components/StatusBadge";

export const metadata: Metadata = {
  title: "目錄",
  description: "The Super One 全書目錄 —— 公開寫作中，一章一章長出來。",
};

export default function BookIndex() {
  const chapters = getChapters();
  const intro = chapters.find((c) => c.stage === 0);

  return (
    <div className="py-14">
      <p className="eyebrow">目錄 · Contents</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--fg-strong)]">
        4 大主題 · 12 章
      </h1>
      <p className="mt-3 max-w-[var(--reading)] text-[var(--muted)]">
        這是一本活書——標著「草稿中／規劃中」的章節會陸續長出來。
      </p>

      {intro && (
        <Link
          href={`/book/${intro.slug}`}
          className="mt-8 flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--line-strong)] p-5 hover:bg-[var(--surface-2)]"
        >
          <div>
            <div className="font-medium text-[var(--fg-strong)]">
              {intro.title}
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{intro.summary}</p>
          </div>
          <StatusBadge status={intro.status} />
        </Link>
      )}

      <div className="mt-12 space-y-12">
        {STAGES.map((stage) => {
          const list = chapters.filter((c) => c.stage === stage.n);
          return (
            <section key={stage.n}>
              <div className="border-b border-[var(--line-strong)] pb-3">
                <div className="eyebrow">
                  Stage {stage.n} · {stage.theme}
                </div>
                <h2 className="mt-1.5 text-lg font-semibold text-[var(--fg-strong)]">
                  {stage.title}
                </h2>
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  {stage.blurb}
                </p>
              </div>

              <ol className="divide-y divide-[var(--line)]">
                {list.map((c) => {
                  const row = (
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-xs tabular-nums text-[var(--metal)]">
                            {String(c.chapter).padStart(2, "0")}
                          </span>
                          <span className="truncate font-medium text-[var(--fg-strong)]">
                            {c.title}
                          </span>
                        </div>
                        <p className="mt-1 pl-8 text-sm text-[var(--muted)]">
                          {c.summary}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  );
                  return (
                    <li key={c.slug}>
                      {c.hasContent ? (
                        <Link
                          href={`/book/${c.slug}`}
                          className="block hover:bg-[var(--surface-2)]"
                        >
                          {row}
                        </Link>
                      ) : (
                        <div className="opacity-60">{row}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
