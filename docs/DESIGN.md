# AI LEAN STARTUP — DESIGN

這份文件定義 aileanstartup.com 的視覺方向與設計系統。
氣質參考 **Dieter Rams**（Braun / Vitsœ）。這是氣質與系統參考，不是複製任何外部品牌資產。
（與 thesuperone.com 共用同一套設計系統 token。）

---

## 產品本質

aileanstartup.com 不是 landing page，而是**一本公開寫作中的書**。
所以設計目標不是「轉換」，而是：

- **可讀**：長文閱讀是第一公民
- **誠實**：草稿就是草稿，狀態與日期照實標示，不假裝完成
- **可演化**：一本一章章長出來的活書，設計要能長期承載
- **高信任、低噪音**

---

## Dieter Rams 十原則 → 本站怎麼落地

| Rams 原則 | 本站做法 |
|---|---|
| As little design as possible | 無漸層、無多餘圓角、無裝飾動態；移除脈動點，改靜態功能標記 |
| Honest（誠實） | 草稿標「草稿中」、顯示更新日期；不用假數字、假完成度 |
| Unobtrusive（不搶戲） | 設計服務閱讀；強調色只做訊號，不主導版面 |
| Long-lasting（長壽） | 中性灰白主體 + 單一功能色，無流行性視覺 |
| Understandable / Useful | 66ch 欄寬、1.9 行高、繁中閱讀優化 |
| Thorough（徹底） | 統一 spacing scale、字級、髮絲線、tabular 編號 |

---

## 版型：全螢幕白底

- 全站白底滿版（`--surface #ffffff`），不做浮動卡片
- header / footer 滿寬，以髮絲線（`--line`）分隔，形成乾淨的水平框架
- 內容置中於寬容器 `max-w-6xl`（約 1152px），左右 `px-6 / sm:px-10`
- **閱讀欄仍守 `--reading: 66ch`**：容器再寬，正文也不犧牲可讀性（Rams：useful 優先）
- 正文與標題在寬容器內**靠左對齊**，與 header 品牌名同一垂直基準線 — 系統化、不漂浮
- `--bg #d9d9d9` 中性灰保留為 token（內凹／未來區塊用），不再作頁面框架

---

## 色彩 Tokens

```
--bg          #d9d9d9   中性灰 — 頁面 / 框架
--surface     #ffffff   白 — 閱讀 / 卡片
--surface-2   #f2f2f0   微內凹（hover / inset）
--fg          #111111   近黑 — 內文（非純黑，長文更好讀）
--fg-strong   #000000   純黑 — 標題
--muted       #6b6b6b   次級文字
--metal       #8a8f95   金屬灰 — 標籤 / meta / 編號
--accent      #ff4b33   Braun 功能橙紅 — 只做訊號
--accent-ink  #d83a23   白底上的可讀變體（內文連結 / 強調字）
--line        rgba(0,0,0,.12)   髮絲線
--line-strong rgba(0,0,0,.24)   區段分隔線
```

### accent 使用規則（嚴格）

- 不用於 `H1 / H2`（標題一律純黑）
- 不作大面積主底色
- 只用於：
  - 公開寫作 live 標記（靜態方點 `.live-mark`）
  - 「草稿中」狀態徽章 + 章節草稿橫幅左線
  - 內文連結與少數重點字（用 `--accent-ink` 確保白底可讀）
- 角色：節制地提醒視線，不是主導版面

### 禁止

- 螢光科技藍、SaaS 漸層、廉價未來感
- 過度圓角、可愛化元件
- 脈動 / 呼吸燈等無謂裝飾動態（Rams：unobtrusive）

---

## 幾何

- `--radius: 2px` — 近乎直角，像產品控制件，不用膠囊鈕 / 大圓角卡
- 按鈕、卡片、徽章一律 `rounded-[var(--radius)]`
- 邊框優先於陰影；如需深度，只用極輕陰影

---

## 排版

- 字體：不引入 Google Fonts，沿用平台 grotesque（SF / Helvetica Neue）+ `PingFang TC`
- 正文欄寬：`--reading: 66ch`
- 正文行高：繁中 `1.9`，字距 `0.01em`
- 標題：純黑、tracking 收緊；繁中字距 `0.02em`、行高 `1.2–1.3`
- **eyebrow / 功能標籤**（`.eyebrow`）：11px、uppercase、tracking `0.14em`、金屬灰 — Braun 儀表標示風
- 編號（章節 / 主題序號）：`font-mono` + `tabular-nums`，像控制面板讀數

### 繁中標題斷行

- 不靠瀏覽器自動換行決定標題外觀；先規劃 2–3 行結構
- 標題不可讓虛字 / 助詞（的、與、在、把、為）單獨留行尾
- 標點不可出現在行首
- 中英混排：`AI`、`OPC`、`Claude Code` 視為同一單位，不可拆散

---

## 元件與 Token 對應

| 元件 | 檔案 | Rams 重點 |
|---|---|---|
| 全域 token | `src/app/globals.css` | 色彩 / 字級 / `.eyebrow` / `.live-mark` / 閱讀優化 |
| 框架（紙頁/層架） | `src/app/layout.tsx` | 灰底白頁、髮絲線、靜態 live 標記 |
| 首頁 | `src/app/page.tsx` | editorial hero、直角鈕、編號式功能卡 |
| 目錄 | `src/app/book/page.tsx` | 系統化索引、Stage eyebrow、髮絲分隔 |
| 章節閱讀 | `src/app/book/[slug]/page.tsx` | 66ch 閱讀欄、草稿橫幅左線、上下章導覽 |
| 狀態徽章 | `src/components/StatusBadge.tsx` | 直角、靜態方點、uppercase 標籤 |

---

## 規則（給後續開發 / Codex）

- 改任何視覺，優先動 token（`globals.css`）與既有 utility，不要新增 CSS module
- 強調色一律走功能訊號規則，新區塊不得把 accent 當主色
- 新增頁面沿用：灰底白頁框架、`.eyebrow` 標籤、66ch 閱讀欄、直角幾何
- 不要把本站做成通用科技公司模板；它是一本書
