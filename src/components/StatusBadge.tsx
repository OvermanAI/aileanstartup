import { ChapterStatus, STATUS_LABEL } from "@/lib/book";

// 功能性狀態標示：近直角、髮絲框、靜態訊號（Rams：unobtrusive / 無謂動態歸零）
const STYLE: Record<ChapterStatus, string> = {
  planned: "border-[var(--line-strong)] text-[var(--metal)]",
  drafting: "border-[var(--accent)]/45 text-[var(--accent-ink)]",
  published: "border-[var(--fg)]/30 text-[var(--fg)]",
};

const DOT: Record<ChapterStatus, string> = {
  planned: "bg-[var(--metal)]",
  drafting: "bg-[var(--accent)]",
  published: "bg-[var(--fg)]",
};

export default function StatusBadge({ status }: { status: ChapterStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius)] border px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider ${STYLE[status]}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-[1px] ${DOT[status]}`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
