import Link from "next/link";
import type { Metadata } from "next";
import { getChapters, STAGES } from "@/lib/book";

export const metadata: Metadata = {
  title: "觀點",
  description:
    "《AI LEAN STARTUP》全書觀點索引——每一節抽出一個核心觀點，一頁看完整本書在主張什麼。",
};

export default function IdeasPage() {
  const chapters = getChapters();
  const sections = chapters.flatMap((c) => c.sections);
  const intro = chapters.find((c) => c.stage === 0);

  function IdeaList({ chapter }: { chapter: (typeof chapters)[number] }) {
    return (
      <ol className="divide-y divide-[var(--line)]">
        {chapter.sections.map((s) => (
          <li key={s.id}>
            <Link
              href={`/book/${chapter.slug}/${s.id}`}
              className={`block px-2 py-4 hover:bg-[var(--surface-2)] ${
                s.hasContent ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span className="shrink-0 font-mono text-xs tabular-nums text-[var(--metal)]">
                  {s.id}
                </span>
                <span className="text-sm text-[var(--muted)]">{s.title}</span>
                {!s.hasContent && (
                  <span className="shrink-0 text-[0.6875rem] text-[var(--metal)]">
                    未開寫
                  </span>
                )}
              </div>
              <p className="mt-1.5 max-w-[var(--reading)] pl-[3.25rem] text-lg font-semibold leading-snug text-[var(--muted)]">
                {s.idea}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="py-14">
      <p className="eyebrow">觀點 · Ideas</p>
      <h1 className="mt-3 text-3xl font-normal tracking-tight text-[var(--fg-strong)]">
        {sections.length} 個觀點
      </h1>
      <p className="mt-3 max-w-[var(--reading)] text-[var(--muted)]">
        全書每一節都只主張一件事。這一頁把那 {sections.length}{" "}
        句話抽出來排在一起——你可以先讀完所有觀點，再決定要進哪一節。
      </p>

      {intro && (
        <p className="mt-8 max-w-[var(--reading)] text-sm text-[var(--muted)]">
          {intro.title}目前是單篇前言，還沒拆成小節——見{" "}
          <Link
            href={`/book/${intro.slug}`}
            className="text-[var(--accent-ink)] hover:underline"
          >
            {intro.title}
          </Link>
          。
        </p>
      )}

      <div className="mt-12 space-y-14">
        {STAGES.map((stage) => (
          <section key={stage.n}>
            <div className="eyebrow">
              {stage.theme} · {stage.title}
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{stage.blurb}</p>
            <div className="mt-6 space-y-10">
              {chapters
                .filter((c) => c.stage === stage.n)
                .map((c) => (
                  <div key={c.slug}>
                    <div className="flex items-baseline gap-3 border-b border-[var(--line-strong)] pb-3">
                      <span className="font-mono text-xs tabular-nums text-[var(--metal)]">
                        {String(c.chapter).padStart(2, "0")}
                      </span>
                      <h2 className="text-lg font-normal text-[var(--fg-strong)]">
                        <Link
                          href={`/book/${c.slug}`}
                          className="hover:text-[var(--accent-ink)]"
                        >
                          {c.title}
                        </Link>
                      </h2>
                    </div>
                    <IdeaList chapter={c} />
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
