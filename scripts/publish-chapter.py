#!/usr/bin/env python3
"""Writing in Public 發布（AI LEAN STARTUP）—— 方法二：Obsidian 源稿 → 網站。

真相來源＝Obsidian「網站源稿」資料夾，兩種組織方式都支援：

  ▸ 子節資料夾（推薦，新結構）
      網站源稿/<部分資料夾>/chXX/01_xxx.md, 02_xxx.md …
      腳本按檔名排序合併，每個 .md 開頭是「## 子節標題」。

  ▸ 舊格式（向後相容）
      網站源稿/<部分資料夾>/<slug>_網站精修版_vN.md
      或根部 <slug>_網站精修版_vN.md（最高版號優先）

預設行為（sync）：
  - 從源稿重生內文
  - 保留 .mdx 既有 frontmatter（title/stage/chapter/summary/status）
  - 保留既有 revisions，追加一筆 {今天, 變更內容}
  - 更新 updated 為今天

日常流程（子節版）：
  1. 在 Obsidian 改  網站源稿/<部分>/chXX/NN_子節標題.md
  2. python3 scripts/publish-chapter.py <slug> "<變更內容>"
  3. git add -A && git commit && git push  → Vercel 自動部署

進階：
  --record-only  只追加修訂紀錄、不動內文（內容沒改、只想留一筆紀錄時用）
  --status S     覆寫狀態（drafting / published）

用法：
  python3 scripts/publish-chapter.py <slug> "<變更內容>" [--status ...] [--record-only]
"""
import sys, re, os, glob, datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OBSIDIAN = os.path.expanduser("~/IDreamAIWorks/AI LEAN STARTUP 電子書")
SRC_ROOT = os.path.join(OBSIDIAN, "網站源稿")
DEST = os.path.join(REPO, "content", "book")
TODAY = datetime.date.today().isoformat()

# 子節資料夾映射：slug → 部分資料夾名稱
PART_MAP = {
    "intro": "00_前言",
    "ch01": "01_第一部_AI一人公司",
    "ch02": "01_第一部_AI一人公司",
    "ch03": "01_第一部_AI一人公司",
    "ch04": "02_第二部_AI_MVP_極速上市",
    "ch05": "02_第二部_AI_MVP_極速上市",
    "ch06": "02_第二部_AI_MVP_極速上市",
    "ch07": "03_第三部_AI_BML_自動化迭代",
    "ch08": "03_第三部_AI_BML_自動化迭代",
    "ch09": "03_第三部_AI_BML_自動化迭代",
    "ch10": "04_第四部_AI_PMF_創業關鍵任務",
    "ch11": "04_第四部_AI_PMF_創業關鍵任務",
    "ch12": "04_第四部_AI_PMF_創業關鍵任務",
}


def resolve_src(slug):
    """回傳 (kind, path_or_dir)：kind='dir'|'file'|None。優先順序：
    1. 子節資料夾（新結構）
    2. 部分資料夾內的帶版號單檔
    3. 根部舊大檔（向後相容）
    """
    part = PART_MAP.get(slug)

    # 1. 子節資料夾
    if slug == "intro":
        single = os.path.join(SRC_ROOT, "00_前言", "intro_網站精修版_v1.md")
        if os.path.exists(single):
            return ("file", single)
    else:
        ch_dir = os.path.join(SRC_ROOT, part, slug) if part else None
        if ch_dir and os.path.isdir(ch_dir):
            files = sorted(glob.glob(os.path.join(ch_dir, "*.md")))
            if files:
                return ("dir", ch_dir)

    # 2. 部分資料夾內的帶版號單檔
    if part:
        hits = glob.glob(os.path.join(SRC_ROOT, part, f"{slug}_網站精修版_v*.md"))
        if hits:
            return ("file", _pick_highest(hits))

    # 3. 根部舊大檔
    hits = glob.glob(os.path.join(SRC_ROOT, f"{slug}_網站精修版_v*.md"))
    if hits:
        return ("file", _pick_highest(hits))

    return (None, None)


def _pick_highest(paths):
    def vnum(p):
        m = re.search(r"_v(\d+)\.md$", p)
        return int(m.group(1)) if m else 0
    return max(paths, key=vnum)


def assemble_from_dir(ch_dir):
    """把資料夾內所有 .md 按名稱排序合併成完整章節正文。
    每個 .md 格式：## 子節標題\\n\\n內文
    """
    files = sorted(glob.glob(os.path.join(ch_dir, "*.md")))
    parts = []
    for f in files:
        txt = open(f, encoding="utf-8").read().strip()
        parts.append(txt)
    return "\n\n".join(parts) + "\n"


def extract_body_from_file(raw):
    raw = re.sub(r'^---\n.*?\n---\n', '', raw, count=1, flags=re.S)
    raw = raw.lstrip('\n')
    raw = re.sub(r'^#\s+.*\n+', '', raw, count=1)
    raw = re.sub(r'^---\s*\n+', '', raw, count=1)
    return raw.strip() + "\n"


def field(fm, key):
    m = re.search(rf'^{key}:\s*(.*)$', fm, re.M)
    return m.group(1).strip() if m else None


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
        kind, src = resolve_src(slug)
        if kind is None:
            print(f"❌ 找不到 {slug} 的源稿。\n"
                  f"   預期位置：{SRC_ROOT}/{PART_MAP.get(slug,'')}/{slug}/\n"
                  f"   若只想記錄修訂、不改內文，請加 --record-only。"); sys.exit(1)
        if kind == "dir":
            body = assemble_from_dir(src)
            n_sections = len(sorted(glob.glob(os.path.join(src, "*.md"))))
            synced = f"已從子節資料夾組裝內文（{n_sections} 個子節，{os.path.basename(src)}/）"
        else:
            body = extract_body_from_file(open(src, encoding="utf-8").read())
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
