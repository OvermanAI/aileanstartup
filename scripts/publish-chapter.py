#!/usr/bin/env python3
"""Writing in Public 發布（AI LEAN STARTUP）—— 方法二：Obsidian 源稿 → 網站。

真相來源＝Obsidian 的「網站源稿」資料夾（每章一個帶版本編號的乾淨稿）：
  ~/IDreamAIWorks/AI LEAN STARTUP 電子書/網站源稿/<slug>_網站精修版_vN.md
腳本自動挑「最高版本號」那一份。

預設行為（sync）：對 content/book/<slug>.mdx
  - 從源稿重生內文（移除頂部 H1 與源稿 frontmatter）
  - 保留 .mdx 既有 frontmatter（title/stage/chapter/summary/status，除非 --status 覆寫）
  - 保留既有 revisions，追加一筆 {今天, 變更內容}——不覆寫歷史
  - 更新 updated 為今天

日常流程：
  1. 在 Obsidian 改 網站源稿/<slug>_網站精修版_vN.md（要做大改版就另存 v(N+1)）
  2. python3 scripts/publish-chapter.py <slug> "<變更內容>"
  3. git add -A && git commit && git push（Vercel 自動部署）

進階：
  --record-only  只追加修訂紀錄、不動內文（內容沒改、只想留一筆紀錄時用）
  --status S     覆寫狀態（drafting / published）

用法：
  python3 scripts/publish-chapter.py <slug> "<變更內容>" [--status ...] [--record-only]
"""
import sys, re, os, glob, datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OBSIDIAN = os.path.expanduser("~/IDreamAIWorks/AI LEAN STARTUP 電子書")
SRC_DIR = os.path.join(OBSIDIAN, "網站源稿")
DEST = os.path.join(REPO, "content", "book")
TODAY = datetime.date.today().isoformat()


def resolve_src(slug):
    """挑最高版本號的源稿；找不到回 None。"""
    hits = glob.glob(os.path.join(SRC_DIR, f"{slug}_網站精修版_v*.md"))
    if not hits:
        return None
    def vnum(p):
        m = re.search(r"_v(\d+)\.md$", p)
        return int(m.group(1)) if m else 0
    return max(hits, key=vnum)


def field(fm, key):
    m = re.search(rf'^{key}:\s*(.*)$', fm, re.M)
    return m.group(1).strip() if m else None


def extract_body(raw):
    raw = re.sub(r'^---\n.*?\n---\n', '', raw, count=1, flags=re.S)  # 源稿 frontmatter（若有）
    raw = raw.lstrip('\n')
    raw = re.sub(r'^#\s+.*\n+', '', raw, count=1)                    # 頂部 H1（章名）
    raw = re.sub(r'^---\s*\n+', '', raw, count=1)                    # 起始分隔線
    return raw.strip() + "\n"


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print(__doc__); sys.exit(1)
    record_only = "--record-only" in args
    status_override = args[args.index("--status") + 1] if "--status" in args else None
    pos = [a for i, a in enumerate(args)
           if not a.startswith("--") and not (i > 0 and args[i - 1] == "--status")]
    slug, note = pos[0], pos[1]

    mdx_path = os.path.join(DEST, f"{slug}.mdx")
    if not os.path.exists(mdx_path):
        print(f"❌ 找不到既有 {slug}.mdx（新章請先建 frontmatter）"); sys.exit(1)

    old = open(mdx_path, encoding="utf-8").read()
    fm = re.match(r'^---\n(.*?)\n---\n', old, re.S).group(1)
    body_old = old[old.index('\n---\n') + 5:].lstrip('\n')

    title = field(fm, "title")
    stage = field(fm, "stage")
    chapter = field(fm, "chapter")
    summary = field(fm, "summary")
    status = status_override or field(fm, "status") or "drafting"

    rev_block = ""
    rm = re.search(r'^revisions:\n((?:[ ]+.*\n?)*)', fm, re.M)
    if rm:
        rev_block = rm.group(1).rstrip("\n") + "\n"

    if record_only:
        body = body_old.rstrip("\n") + "\n"
        synced = "record-only（內文未變動，僅記錄修訂）"
    else:
        src = resolve_src(slug)
        if not src:
            print(f"❌ 找不到 {slug} 的源稿（{SRC_DIR}/{slug}_網站精修版_vN.md）。"
                  f"\n   若只想記錄修訂、不改內文，請加 --record-only。"); sys.exit(1)
        body = extract_body(open(src, encoding="utf-8").read())
        synced = f"已從源稿同步內文（{os.path.basename(src)}）"

    new_rev = f'  - date: "{TODAY}"\n    note: "{note}"\n'
    out = (
        f"---\n"
        f"title: {title}\n"
        f"stage: {stage}\n"
        f"chapter: {chapter}\n"
        f'slug: "{slug}"\n'
        f"status: {status}\n"
        f"updated: {TODAY}\n"
        f"summary: {summary}\n"
        f"revisions:\n{rev_block}{new_rev}"
        f"---\n\n{body}"
    )
    open(mdx_path, "w", encoding="utf-8").write(out)
    n = out.count('  - date:')
    print(f"✅ {slug}.mdx｜狀態 {status}｜修訂 {n} 筆（最新：{note}）\n   {synced}")


if __name__ == "__main__":
    main()
