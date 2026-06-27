#!/usr/bin/env python3
"""Writing in Public 修訂記錄（AI LEAN STARTUP）。

預設 record-only：對既有 content/book/<slug>.mdx
  - 保留 frontmatter（title/stage/chapter/summary/status，除非 --status 覆寫）
  - 保留既有 revisions，最後「追加」一筆 {今天, 變更內容}——不覆寫歷史
  - 內文「不動」（網站 .mdx 視為真相來源）
  - 更新 updated 為今天

為什麼預設不從 Obsidian 同步：本書的 Obsidian 源稿是「一句一行」的草稿，
網站 .mdx 已是「合併成段落」的精修版。從 Obsidian 重生會把精修內容打回草稿。
故內容請直接改 .mdx；本腳本只負責「留下公開修訂紀錄」。

進階：--sync 才會從 Obsidian 重生內文（會覆蓋網站精修版，請確認 Obsidian 才是最新）。
  Obsidian 解析：intro → 00_前言/正文.md；chNN → **/CHNN.md（CH01/02/03/10 有）

用法：
  python3 scripts/publish-chapter.py <slug> "<變更內容>" [--status drafting|published] [--sync]
"""
import sys, re, os, glob, datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OBSIDIAN = os.path.expanduser("~/IDreamAIWorks/AI LEAN STARTUP 電子書")
DEST = os.path.join(REPO, "content", "book")
TODAY = datetime.date.today().isoformat()

INTRO_SRC = "00_前言/正文.md"


def resolve_src(slug):
    if slug == "intro":
        p = os.path.join(OBSIDIAN, INTRO_SRC)
        return p if os.path.exists(p) else None
    m = re.fullmatch(r"ch(\d{2})", slug)
    if m:
        hits = glob.glob(os.path.join(OBSIDIAN, "**", f"CH{m.group(1)}.md"), recursive=True)
        return hits[0] if hits else None
    return None


def field(fm, key):
    m = re.search(rf'^{key}:\s*(.*)$', fm, re.M)
    return m.group(1).strip() if m else None


def extract_body(raw):
    raw = re.sub(r'^---\n.*?\n---\n', '', raw, count=1, flags=re.S)  # 源稿 frontmatter
    raw = raw.lstrip('\n')
    raw = re.sub(r'^#\s+.*\n+', '', raw, count=1)                    # 頂部 H1
    raw = re.sub(r'^---\s*\n+', '', raw, count=1)                    # 起始分隔線
    return raw.strip() + "\n"


def main():
    args = [a for a in sys.argv[1:]]
    if len(args) < 2:
        print(__doc__); sys.exit(1)
    do_sync = "--sync" in args
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

    if do_sync:
        src = resolve_src(slug)
        if not src:
            print(f"❌ --sync 但找不到 {slug} 的 Obsidian 源稿；改用預設 record-only 重跑")
            sys.exit(1)
        body = extract_body(open(src, encoding="utf-8").read())
        synced = f"⚠ 已從 Obsidian 覆蓋內文（{os.path.relpath(src, OBSIDIAN)}）"
    else:
        body = body_old.rstrip("\n") + "\n"
        synced = "record-only（內文未變動，僅記錄修訂）"

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
