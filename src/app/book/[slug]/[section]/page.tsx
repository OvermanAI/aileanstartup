import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  getAllSections,
  getSection,
  sectionNeighbors,
  STATUS_LABEL,
} from "@/lib/book";
import StatusBadge from "@/components/StatusBadge";

export function generateStaticParams() {
  return getAllSections().map((s) => ({ slug: s.chapter, section: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}): Promise<Metadata> {
  const { slug, section } = await params;
  const found = getSection(slug, section);
  if (!found) return {};
  return { title: found.meta.title, description: found.meta.idea };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug, section } = await params;
  const found = getSection(slug, section);
  if (!found) notFound();

  const { meta, chapter, content } = found;
  const { prev, next } = sectionNeighbors(slug, section);
  const empty = !meta.hasContent;

  return (
    <article className="py-14">
      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
        <Link href="/book" className="hover:text-[var(--fg-strong)]">
          ← 目錄
        </Link>
        <span className="text-[var(--metal)]">/</span>
        <Link
          href={`/book/${chapter.slug}`}
          className="hover:text-[var(--fg-strong)]"
        >
          {chapter.title}
        </Link>
        <StatusBadge status={meta.status} />
      </div>

      <p className="mt-6 font-mono text-xs tabular-nums tracking-wider text-[var(--metal)]">
        {meta.id}
      </p>
      <h1 className="mt-1.5 max-w-[var(--reading)] text-3xl font-semibold leading-[1.25] tracking-tight text-[var(--fg-strong)]">
        {meta.title}
      </h1>

      {meta.idea && (
        <p className="mt-5 max-w-[var(--reading)] border-l-2 border-[var(--accent)] pl-4 text-lg leading-relaxed text-[var(--fg)]">
          {meta.idea}
        </p>
      )}

      {empty ? (
        <div className="mt-10 max-w-[var(--reading)] rounded-[var(--radius)] border border-dashed border-[var(--line-strong)] p-10 text-center text-[var(--muted)]">
          <p className="text-lg font-medium text-[var(--fg-strong)]">還沒開寫</p>
          <p className="mt-2">
            這一節在目錄骨架裡已經有位置，但正文還沒長出來。
          </p>
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
          <Link
            href={`/book/${prev.chapter}/${prev.id}`}
            className="group max-w-[45%]"
          >
            <div className="eyebrow">← 上一節 {prev.id}</div>
            <div className="mt-1 font-medium text-[var(--fg)] group-hover:text-[var(--accent-ink)]">
              {prev.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/book/${next.chapter}/${next.id}`}
            className="group max-w-[45%] text-right"
          >
            <div className="eyebrow">下一節 {next.id} →</div>
            <div className="mt-1 font-medium text-[var(--fg)] group-hover:text-[var(--accent-ink)]">
              {next.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <p className="mt-10 flex items-center justify-center gap-2 text-xs text-[var(--metal)]">
        <span className="live-mark" />
        <span className="eyebrow">
          {STATUS_LABEL[meta.status]} · Writing in Public
        </span>
      </p>
    </article>
  );
}
