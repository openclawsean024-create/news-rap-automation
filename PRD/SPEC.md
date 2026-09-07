# news-rap-automation · PRD v3.0.2 等級規格書

> 自動生成：2026-09-06（Sean 10-repo-fleet Batch 7C）
> 對齊 SPEC v3.0 契約（SPEC §1–§19 全部套用）
> 前置：v3.0.0 sweet-spot-driven rewrite（2026-07-19，Sophia CPO）+ v2.0 純前端 Boom Bap 落地

---

## 1. 產品概述

### 1.1 問題陳述
新聞 × 音樂是社群短影音的高潛力題材，但目前沒有任何工具能讓創作者「**把新聞內文丟進去、3 秒拿到一段 Boom Bap 配樂 + 押韻歌詞 + 可下載 WAV**」。CapCut 只能剪現成音檔、Suno/Udio 不能吃中文新聞、純 LLM prompt 押韻品質 < 50%。

更關鍵：所有市面上的方案都至少要一個 API key（OpenAI / Replicate / ElevenLabs），對只是想試一次的 Podcast 創作者是**致命門檻**。本工具砍掉這層摩擦——純瀏覽器、零 API key、打開就能用。

### 1.2 目標使用者
| Persona | 工作情境 | 主要任務 |
|---|---|---|
| Primary · 傑克（Podcast 實驗創作者）| 週 1 集，想試「新聞 → rap」企劃 | 貼新聞 → 拿到押韻歌詞 + 8 拍 Boom Bap + WAV |
| Secondary · 小安（YouTube Shorts 編輯）| 日 2-3 支，要快速配樂 | 貼新聞 → 換 BPM / 換風格 → 輸出 |
| Tertiary · 凱文（社群小編）| 偶爾做哏圖配樂 | 用敏感詞過濾避開爭議 |

### 1.3 核心價值主張
> **「零 API key、純瀏覽器 — 新聞貼上、押韻歌詞 + Boom Bap WAV 一鍵出。」**

### 1.4 Non-Goals（明確不做）
- ❌ STT / TTS 雲端 API（純瀏覽器 `speechSynthesis` 即可）
- ❌ 後端 SaaS 帳號 / 訂閱
- ❌ 影音剪輯（CapCut 紅海）
- ❌ AI 圖像生成（Midjourney / DALL-E 紅海）
- ❌ 多語言（v1 繁中 only）
- ❌ 多人協作 / 後台
- ❌ 智慧型手機 App（純網頁即可）

---

## 2. 使用者場景與流程

### 2.1 使用者流程圖

```mermaid
flowchart LR
  A[打開首頁] --> B[貼上新聞內文]
  B --> C{啟用敏感詞過濾?}
  C -->|是| D[過濾政治詞 → [TOPIC]]
  C -->|否| E[原文]
  D --> F[按「生成歌詞」]
  E --> F
  F --> G[規則式押韻歌詞<br/>4-8 行]
  G --> H[選 BPM 60-180]
  H --> I[選風格<br/>Boom Bap / Trap / Lo-fi]
  I --> J[按「播放」]
  J --> K[Web Audio 即時播放<br/>+ speechSynthesis TTS]
  K --> L{滿意?}
  L -->|否| G
  L -->|是| M[按「匯出 WAV」]
  M --> N[OfflineAudioContext<br/>渲染 30s loop]
  N --> O[手寫 RIFF header]
  O --> P[下載 .wav 檔]
```

### 2.2 主要場景

| 場景 | 輸入 | 輸出 | 成功條件 |
|---|---|---|---|
| 1. 貼新聞→拿歌詞 | 新聞內文 50-500 字 | 4-8 行押韻歌詞 | 啟發式押韻 AA BB CC DD 結構 |
| 2. 選風格→拿配樂 | BPM + 風格 (boombap/trap/lofi) | 即時播放 | 8 bar 循環、kicker+snare+hat+bass 齊全 |
| 3. 匯出 WAV | (點匯出) | .wav 檔 | 16-bit PCM mono 30 秒、可在系統播放器播 |
| 4. 敏感詞過濾 | 啟用 filter | 過濾後歌詞 | 內建 22 字政治詞庫替換為 `[TOPIC]` |
| 5. TTS 旁白 | (點播放) | speechSynthesis 唸出 | 繁中 zh-TW voice |

---

## 3. 功能需求

| FR | 名稱 | 優先級 | 狀態 |
|---|---|---|---|
| FR-001 | 新聞內文輸入（textarea）| P0 | ✅ shipped |
| FR-002 | 規則式押韻歌詞生成（4-8 行）| P0 | ✅ shipped |
| FR-003 | 敏感詞過濾（內建 22 字政治詞）| P0 | ✅ shipped |
| FR-004 | Web Audio 即時播放（speechSynthesis + drum loop）| P0 | ✅ shipped |
| FR-005 | BPM 調整（60-180，預設 90）| P0 | ✅ shipped |
| FR-006 | 3 種風格切換（Boom Bap / Trap / Lo-fi）| P0 | ✅ shipped |
| FR-007 | WAV 匯出（16-bit PCM mono，30 秒）| P0 | ✅ shipped |
| FR-008 | 純前端、零 API key、零後端 | P0 | ✅ shipped |
| FR-009 | Tailwind v4 印刷感 / Boom Bap 視覺 | P1 | ✅ shipped |
| FR-010 | TTS 旁白（zh-TW）| P1 | ✅ shipped |
| FR-011 | 過濾命中清單顯示 | P1 | ✅ shipped |
| FR-012 | 已過濾歌詞的視覺化提示 | P1 | ✅ shipped |
| FR-013 | 下載連結 blob URL | P1 | ✅ shipped |
| FR-014 | SSR 安全的 `useEffect` cleanup（AudioContext.close）| P0 | ✅ shipped |
| FR-015 | 錯誤狀態顯示（filter 後太短等）| P1 | ✅ shipped |
| FR-016 | GHA CI 4-job workflow | P1 | ✅ shipped (v3.0.2) |
| FR-017 | PRD v3.0.2 規格書 + CHANGELOG | P1 | ✅ shipped (v3.0.2) |
| FR-018 | 單元測試（vitest，押韻 + WAV + filter）| P1 | ⏳ planned |
| FR-019 | 多韻腳風格切換（國語 / 台語 / 雙押）| P2 | ⏳ planned |
| FR-020 | PWA / 離線可播 | P2 | ⏳ planned |
| FR-021 | 歌詞匯出 Markdown | P2 | ⏳ planned |

---

## 4. Non-Functional Requirements

| 維度 | 需求 |
|---|---|
| Performance | 啟動 < 1s；WAV 渲染 < 3s；歌詞生成 < 100ms |
| Security | 無後端、零資料外洩；WAV 純前端生成不下傳 |
| Privacy | 零 telemetry、零 analytics、新聞文字不離開瀏覽器 |
| Accessibility | WCAG 2.1 AA（按鈕 aria-label、色彩對比 ≥ 4.5:1）|
| Browser | Modern evergreen (Chrome / Edge / Safari 14+ / Firefox 90+) |
| Responsive | 桌機優先；行動 ≥ 360px 仍可閱讀（不主打手機）|
| Build | Next.js 16 + Turbopack；產出靜態頁 + client bundle |
| SEO | 基本 meta tags（title / description / og:image 留 hook）|

---

## 5. 技術架構

```
news-rap-automation (Next.js 16 App Router)
├── app/
│   ├── page.tsx              # 主 UI（貼新聞 / 歌詞 / 播放 / 匯出）
│   ├── layout.tsx            # root layout
│   ├── globals.css           # Tailwind v4 + Boom Bap 色票
│   └── lib/
│       ├── lyrics.ts         # 規則式押韻 + 過濾（純函式，無 React）
│       └── audioEngine.ts    # Web Audio drum + bass + WAV encoder
├── PRD/
│   ├── SPEC.md
│   └── CHANGELOG.md
├── .github/workflows/ci.yml
├── next.config.ts            # App Router + Turbopack
├── tsconfig.json
├── tailwind / postcss
└── vercel.json               # framework: nextjs
```

### 5.1 Module Map
- `app/` — 主要程式碼（單一頁面 + lib）
- `tests/` — 單元測試（v3.0.2 之後可加）
- `.next/` — 構建產物（gitignore）
- `.github/workflows/` — CI/CD

### 5.2 環境變數
- 無（純前端 / 零 API key）

### 5.3 降級策略
- TTS 不可用（無語音引擎）→ 仍可播 drum loop、歌詞可看
- Web Audio 不可用（極舊瀏覽器）→ 顯示「請使用現代瀏覽器」並關閉按鈕
- WAV 渲染失敗 → 顯示錯誤 toast
- 歌詞生成後 < 4 字 → 顯示「請貼更長的新聞內文」

---

## 6. Definition of Done

- [x] FR P0 全部實作（FR-001 ~ FR-008）
- [x] `npm run build` 綠
- [x] `npm run lint` 0 error
- [x] GHA CI 4-job workflow（lint / test / build / deploy to Vercel）
- [x] README 反映現況
- [x] PRD/SPEC.md v3.0.2 等級規格書
- [x] PRD/CHANGELOG.md 含 v3.0.2 條目
- [x] Vercel deploy 設定完成（vercel.json: framework: nextjs）
- [x] 純前端、零 API key、零後端
- [x] 零 telemetry、零資料外洩
- [x] 敏感詞過濾內建 22 字政治詞庫

---

## 7. 部署契約

| 環境 | 目標 | 觸發 |
|---|---|---|
| Production | Vercel | push to main |
| Preview | Per-PR（Vercel 自動）| PR opened |

### 7.1 GHA Workflow
- `.github/workflows/ci.yml`
- jobs: lint / test / build / deploy
- deploy: **Vercel**（vercel-action 需 VERCEL_TOKEN / ORG_ID / PROJECT_ID secrets；Vercel Hobby 平台已掛 GitHub auto-deploy，所以 GHA deploy 步驟為輔助，正式 production deploy 由 Vercel 原生觸發）

### 7.2 環境變數
- 無需 server-side secret
- 無 BYOK（純前端、不接 LLM API）

---

## 8. Out of Scope（不做的）

- ❌ 帳號系統（永遠不做）
- ❌ 付費牆（永遠不做）
- ❌ 原生 App
- ❌ 多語系（v1 繁中 only）
- ❌ 即時協作 / 後台
- ❌ 新聞版權處理（使用者自負）

---

## 9. 變更日誌

見 [`PRD/CHANGELOG.md`](PRD/CHANGELOG.md)
