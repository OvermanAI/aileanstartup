import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { CANON, getChapter, chapterNeighbors, STATUS_LABEL } from "@/lib/book";
import StatusBadge from "@/components/StatusBadge";

export function generateStaticParams() {
  return CANON.map((c) => ({ slug: c.slug }));
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

      {meta.status === "drafting" && (
        <p className="mt-5 flex max-w-[var(--reading)] items-start gap-3 rounded-[var(--radius)] border-l-2 border-[var(--accent)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--fg)]">
          <span className="mt-1 live-mark shrink-0" />
          <span>
            這是一份<b>公開草稿</b>。內容還在迭代，歡迎一起把它變得更好。
          </span>
        </p>
      )}

      {planned ? (
        <div className="mt-10 rounded-[var(--radius)] border border-dashed border-[var(--line-strong)] p-10 text-center text-[var(--muted)]">
          <p className="text-lg font-medium text-[var(--fg-strong)]">即將公開</p>
          <p className="mt-2">{meta.summary}</p>
          <p className="mt-4 text-sm">這一章還在排隊。訂閱後上線會通知你。</p>
        </div>
      ) : (
        <div className="prose prose-zh prose-neutral mt-8 max-w-[var(--reading)] prose-headings:font-semibold prose-headings:text-[var(--fg-strong)] prose-a:text-[var(--accent-ink)] prose-strong:text-[var(--fg-strong)] prose-pre:rounded-[var(--radius)] prose-pre:bg-[#111111] prose-pre:text-zinc-100">
          <MDXRemote
            source={content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
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

      {!planned && meta.revisions && meta.revisions.length > 0 && (
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
