import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WRITING IN PUBLIC",
  description:
    "用 AI ＋ 你的品味，公開寫出一本能提升個人品牌的電子書。你出品味，AI 出技能。免費領取《WIP 實戰指南》。",
};

// TODO: 接上 email 名單服務 + 《WIP 實戰指南》下載連結後，替換此佔位連結
const CLAIM_HREF = "#";

export default function WritingInPublic() {
  return (
    <div className="py-14">
      {/* ── Hero ── */}
      <p className="flex items-center gap-2">
        <span className="live-mark" />
        <span className="eyebrow">WRITING IN PUBLIC · 公開寫作</span>
      </p>

      <h1 className="mt-6 max-w-[var(--reading)] text-4xl font-semibold leading-[1.12] tracking-tight text-[var(--fg-strong)] sm:text-5xl">
        不會寫作，也能公開寫出一本書——把你的名字變成品牌。
      </h1>

      <p className="prose-zh mt-6 max-w-[var(--reading)] text-lg text-[var(--muted)]">
        <strong className="text-[var(--fg-strong)]">你出品味，AI 出技能。</strong>
        選一個你想學會的題目，邊學、邊做、邊公開——書寫完那天，你也真的會了。
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
        <Link
          href={CLAIM_HREF}
          className="rounded-[var(--radius)] bg-[var(--fg-strong)] px-6 py-3 text-sm font-medium text-[var(--surface)] transition-opacity hover:opacity-85"
        >
          免費領取《WIP 實戰指南》
        </Link>
        <span className="text-sm text-[var(--muted)]">
          一份把整套方法濃縮成今天就能照做的指南。
        </span>
      </div>

      {/* ── 痛點 ── */}
      <section className="mt-16 border-t border-[var(--line)] pt-10">
        <p className="eyebrow">你是不是這樣</p>
        <ul className="prose-zh mt-4 max-w-[var(--reading)] space-y-2 text-[var(--fg)]">
          <li>想過出一本書、建立專業形象——但「我又不會寫」。</li>
          <li>不知道要寫什麼，連題目都卡住。</li>
          <li>怕辛苦寫完，根本沒人看。</li>
          <li>想用 AI，又怕生出一堆沒靈魂、一眼就被看穿的垃圾。</li>
        </ul>
      </section>

      {/* ── 換一種寫法 ── */}
      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <p className="eyebrow">換一種寫法</p>
        <p className="prose-zh mt-4 max-w-[var(--reading)] text-lg">
          你<strong className="text-[var(--fg-strong)]">不需要先會</strong>。
          WRITING IN PUBLIC 教你用 AI 把一本書「長」出來：三層素材打底、
          用你嚮往的範例逆向出你的寫作風格、邊寫邊公開，再用「作品鉤子」把真讀者帶進來。
          <strong className="text-[var(--fg-strong)]">技能交給 AI，品味留給你。</strong>
        </p>
      </section>

      {/* ── 你會帶走什麼 ── */}
      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <p className="eyebrow">你會帶走什麼</p>
        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {[
            ["一本公開上架的電子書", "從初稿起步，一路公開迭代、長大。"],
            ["一個個人品牌", "書寫完，你多了一項真本事與一個被看見的名字。"],
            ["你的專屬寫作系統", "從你愛的文章逆向出的風格規格，AI 永遠用你的聲音寫。"],
            ["一套提示詞模板庫", "每章累積，讀完即是一套可重複用的工具。"],
            ["一群真讀者", "用作品鉤子跑 BML，數據選贏家，把陌生人變訂閱。"],
            ["一個能賣的數位產品", "把累積的資產，變成在你書站上銷售的收入。"],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="font-semibold text-[var(--fg-strong)]">{t}</div>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 誰適合 ── */}
      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <p className="eyebrow">誰適合</p>
        <p className="prose-zh mt-4 max-w-[var(--reading)]">
          任何想用一本書建立個人品牌的人——創業者、教練、顧問、上班族，
          <strong className="text-[var(--fg-strong)]">甚至一個高中生</strong>。
          你需要的不是寫作技能，是品味；而品味，你已經有了。
        </p>
      </section>

      {/* ── 誠實證據（dogfood）── */}
      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <p className="eyebrow">這不是理論</p>
        <p className="prose-zh mt-4 max-w-[var(--reading)] text-lg">
          你眼前這本書，就是用這套方法公開寫出來的。
          WRITING IN PUBLIC 本身，也是用它自己教的方法做出來、賣出去的數位產品。
        </p>
      </section>

      {/* ── 最終 CTA ── */}
      <section className="mt-14 rounded-[var(--radius)] border border-[var(--line-strong)] bg-[var(--surface-2)] px-6 py-10 text-center sm:px-10">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg-strong)]">
          先免費拿走整套方法。
        </h2>
        <p className="prose-zh mx-auto mt-3 max-w-[var(--reading)] text-[var(--muted)]">
          《WIP 實戰指南》把找題目、收素材、建寫作系統、公開發布、養讀者，
          濃縮成一份你今天就能照做的指南。
        </p>
        <div className="mt-7 flex justify-center">
          <Link
            href={CLAIM_HREF}
            className="rounded-[var(--radius)] bg-[var(--fg-strong)] px-7 py-3 text-sm font-medium text-[var(--surface)] transition-opacity hover:opacity-85"
          >
            免費領取《WIP 實戰指南》
          </Link>
        </div>
      </section>

      <p className="mt-8 text-sm text-[var(--muted)]">作者：AI-MAN · 公開寫作中。</p>
    </div>
  );
}
