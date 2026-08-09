import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getChapters, getChapter, chapterNeighbors, STATUS_LABEL } from "@/lib/book";
import StatusBadge from "@/components/StatusBadge";

export function generateStaticParams() {
  return getChapters().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ch = getChapter(slug);
  if (!ch) return {};
  return { title: ch.meta.title, description: ch.meta.summary };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ch = getChapter(slug);
  if (!ch) notFound();

  const { meta, content } = ch;
  const { prev, next } = chapterNeighbors(slug);
  const written = meta.sections.filter((s) => s.hasContent).length;
  const planned = meta.status === "planned" || !meta.hasContent;

  return (
    <article className="py-14">
      <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
        <Link href="/book" className="hover:text-[var(--fg-strong)]">
          ← 目錄
        </Link>
        <StatusBadge status={meta.status} />
        {meta.updated && (
          <span className="font-mono text-xs tabular-nums text-[var(--metal)]">
            更新於 {meta.updated}
          </span>
        )}
      </div>

      <h1 className="mt-5 max-w-[var(--reading)] text-3xl font-semibold leading-[1.25] tracking-tight text-[var(--fg-strong)]">
        {meta.title}
      </h1>
      {meta.summary && (
        <p className="mt-3 max-w-[var(--reading)] text-[var(--muted)]">
          {meta.summary}
        </p>
      )}

      {meta.status === "drafting" && (
        <p className="mt-5 flex max-w-[var(--reading)] items-start gap-3 rounded-[var(--radius)] border-l-2 border-[var(--accent)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--fg)]">
          <span className="mt-1 live-mark shrink-0" />
          <span>
            這是一份<b>公開草稿</b>。內容還在迭代，歡迎一起把它變得更好。
          </span>
        </p>
      )}

      {planned && (
        <div className="mt-10 rounded-[var(--radius)] border border-dashed border-[var(--line-strong)] p-10 text-center text-[var(--muted)]">
          <p className="text-lg font-medium text-[var(--fg-strong)]">即將公開</p>
          <p className="mt-2">{meta.summary}</p>
          <p className="mt-4 text-sm">這一章還在排隊。訂閱後上線會通知你。</p>
        </div>
      )}

      {content.trim() && (
        <div className="prose prose-zh prose-neutral mt-8 max-w-[var(--reading)] prose-headings:font-semibold prose-headings:text-[var(--fg-strong)] prose-a:text-[var(--accent-ink)] prose-strong:text-[var(--fg-strong)] prose-pre:rounded-[var(--radius)] prose-pre:bg-[#111111] prose-pre:text-zinc-100">
          <MDXRemote
            source={content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
      )}

      {meta.sections.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between border-b border-[var(--line-strong)] pb-3">
            <h2 className="text-lg font-normal text-[var(--fg-strong)]">
              本章小節
            </h2>
            <span className="font-mono text-xs tabular-nums text-[var(--metal)]">
              {written} / {meta.sections.length} 已開寫
            </span>
          </div>

          <ol className="divide-y divide-[var(--line)]">
            {meta.sections.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/book/${meta.slug}/${s.id}`}
                  className={`block hover:bg-[var(--surface-2)] ${s.hasContent ? "" : "opacity-60"}`}
                >
                  <div className="flex items-start justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-3">
                        <span className="shrink-0 font-mono text-xs tabular-nums text-[var(--metal)]">
                          {s.id}
                        </span>
                        <span className="font-medium text-[var(--fg-strong)]">
                          {s.title}
                        </span>
                      </div>
                      <p className="mt-1 pl-[3.25rem] text-sm text-[var(--muted)]">
                        {s.idea}
                      </p>
                    </div>
                    {!s.hasContent && (
                      <span className="shrink-0 text-[0.6875rem] text-[var(--metal)]">
                        未開寫
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <nav className="mt-16 flex justify-between gap-4 border-t border-[var(--line)] pt-6 text-sm">
        {prev ? (
          <Link href={`/book/${prev.slug}`} className="group max-w-[45%]">
            <div className="eyebrow">← 上一章</div>
            <div className="mt-1 font-medium text-[var(--fg)] group-hover:text-[var(--accent-ink)]">
              {prev.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/book/${next.slug}`}
            className="group max-w-[45%] text-right"
          >
            <div className="eyebrow">下一章 →</div>
            <div className="mt-1 font-medium text-[var(--fg)] group-hover:text-[var(--accent-ink)]">
              {next.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {meta.revisions && meta.revisions.length > 0 && (
        <section className="mt-14 border-t border-[var(--line)] pt-6">
          <p className="eyebrow">修訂紀錄 · Changelog</p>
          <ul className="mt-4 space-y-2.5">
            {meta.revisions
              .slice()
              .reverse()
              .map((r, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-[var(--muted)]"
                >
                  <span className="shrink-0 font-mono text-xs tabular-nums text-[var(--metal)]">
                    {r.date}
                  </span>
                  <span>{r.note}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <p className="mt-10 flex items-center justify-center gap-2 text-xs text-[var(--metal)]">
        <span className="live-mark" />
        <span className="eyebrow">
          {STATUS_LABEL[meta.status]} · Writing in Public
        </span>
      </p>
    </article>
  );
}
