import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aileanstartup.com"),
  title: {
    default: "AI LEAN STARTUP — AI 精實創業",
    template: "%s · AI LEAN STARTUP",
  },
  description:
    "一本公開寫作中的書。用 Agent 實踐 AI 精實創業，打造賺錢的 AI 一人公司：AI MVP → AI BML → AI PMF。",
  openGraph: {
    title: "AI LEAN STARTUP — AI 精實創業",
    description: "公開寫作中的活書：AI MVP → AI BML → AI PMF，打造賺錢的 AI 一人公司。",
    type: "website",
    locale: "zh_TW",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className="flex min-h-screen flex-col bg-[var(--surface)] text-[var(--fg)] antialiased">
        {/* 全螢幕版型：白底滿版，chrome 滿寬髮絲線，內容置中於寬容器 */}
        <header className="border-b border-[var(--line)]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
            <Link
              href="/"
              className="text-[var(--fg-strong)] font-semibold tracking-tight"
            >
              AI LEAN STARTUP
            </Link>
            <nav className="flex items-center gap-6 text-sm text-[var(--muted)]">
              <Link href="/book" className="hover:text-[var(--fg-strong)]">
                目錄
              </Link>
              <Link href="/log" className="hover:text-[var(--fg-strong)]">
                日誌
              </Link>
              <Link href="/about" className="hover:text-[var(--fg-strong)]">
                關於
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 sm:px-10">
          {children}
        </main>

        <footer className="border-t border-[var(--line)]">
          <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-[var(--muted)] sm:px-10">
            <p className="flex items-center gap-2">
              <span className="live-mark" />
              <span className="eyebrow">Writing in Public</span>
            </p>
            <p className="mt-3 text-[var(--fg)]">
              《AI LEAN STARTUP — AI 精實創業》
            </p>
            <p className="mt-0.5">作者 AI-MAN · 公開寫作中</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
