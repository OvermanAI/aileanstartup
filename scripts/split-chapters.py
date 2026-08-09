#!/usr/bin/env python3
"""把 content/book/chXX.mdx 依 scripts/sections.json 拆成一節一檔（H2 為界）。

原文一字不改，只搬動區塊、加 frontmatter。原始 chXX.mdx 移到 content/_archive/ 保留，不刪除。
intro.mdx 不拆（維持單檔 _index.mdx，跟 idreamaiworks 的 intro 處理方式一致）。
"""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / "content" / "book"
ARCHIVE = ROOT / "content" / "_archive"
SPEC = json.loads((ROOT / "scripts" / "sections.json").read_text(encoding="utf8"))


def read_source(name):
    raw = (BOOK / f"{name}.mdx").read_text(encoding="utf8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
    return (m.group(1), m.group(2)) if m else ("", raw)


def parse_fm(fm_text):
    out = {}
    for line in fm_text.split("\n"):
        m = re.match(r'^(\w+):\s*"?(.*?)"?\s*$', line)
        if m and not line.startswith(" ") and not line.startswith("-"):
            out[m.group(1)] = m.group(2)
    return out


def yaml_quote(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def split_h2(body):
    parts = re.split(r"^(## .+)$", body, flags=re.M)
    blocks = []
    for i in range(1, len(parts), 2):
        heading = parts[i][3:].strip()
        block = parts[i + 1] if i + 1 < len(parts) else ""
        blocks.append((heading, block.strip()))
    return blocks


def build():
    written = []
    for ch in SPEC["chapters"]:
        dirname = ch["dir"]
        fm_text, body = read_source(dirname)
        fm = parse_fm(fm_text)
        blocks = split_h2(body)

        if len(blocks) != len(ch["sections"]):
            raise SystemExit(
                f"[{dirname}] H2 數量 {len(blocks)} 與 sections.json 條目數 {len(ch['sections'])} 不符"
            )

        chapter_num = int(fm["chapter"])
        stage = int(fm["stage"])
        outdir = BOOK / dirname
        outdir.mkdir(exist_ok=True)

        # _index.mdx：帶走章級 frontmatter（title/stage/order/updated/summary/revisions），無正文
        revisions_block = ""
        if "revisions:" in fm_text:
            m = re.search(r"^revisions:\n((?:  .+\n?)+)", fm_text, re.M)
            if m:
                revisions_block = "revisions:\n" + m.group(1).rstrip("\n") + "\n"

        index_fm = (
            f'title: {yaml_quote(fm["title"])}\n'
            f"stage: {stage}\n"
            f"order: {chapter_num}\n"
            f'updated: {fm.get("updated", "")}\n'
            f'summary: {yaml_quote(fm.get("summary", ""))}\n'
            f"{revisions_block}"
        )
        (outdir / "_index.mdx").write_text(f"---\n{index_fm}---\n\n", encoding="utf8")

        # 逐節
        for spec, (heading, block) in zip(ch["sections"], blocks):
            sid = f'{chapter_num}-{spec["n"]}'
            sec_fm = (
                f"title: {yaml_quote(heading)}\n"
                f'chapter: "{dirname}"\n'
                f'section: "{sid}"\n'
                f"stage: {stage}\n"
                f'idea: {yaml_quote(spec["idea"])}\n'
                f"status: drafting\n"
                f'origin: "原 {dirname} 內容拆分（2026-08-09）"\n'
            )
            (outdir / f"{sid}.mdx").write_text(
                f"---\n{sec_fm}---\n\n{block}\n", encoding="utf8"
            )
            written.append(sid)

        # 原始檔案封存
        ARCHIVE.mkdir(exist_ok=True)
        shutil.move(str(BOOK / f"{dirname}.mdx"), str(ARCHIVE / f"{dirname}.mdx"))

    print(f"完成：{len(SPEC['chapters'])} 章、{len(written)} 節")


if __name__ == "__main__":
    build()
