# news-rap-automation · CHANGELOG

所有對 `news-rap-automation` 規格 / 部署 / 測試的版本變更紀錄。

---

## v3.0.2 — 2026-09-06（repo-fleet 升級）

> 由 repo-fleet 批次 7C 自動駕駛：Sean Li / Mavis worker agent
> v3.0.2 完成於 2026-09-06 by Sean 10-repo-fleet

### Added
- `PRD/SPEC.md` v3.0.2 等級規格書（問題陳述 / FR table / NFR / 部署契約 / mermaid flow）
- `PRD/CHANGELOG.md` 本檔
- `.github/workflows/ci.yml` GHA 4-job workflow（lint / test / build / deploy to Vercel）

### Verified
- ✅ `npm run lint` — 0 error（tsc --noEmit）
- ✅ `npm test` — 全部 vitest 綠
- ✅ `npm run build` — Next.js 16 構建綠（首頁 + 靜態資產）
- ✅ Vercel deploy target 已掛

---

## v3.0.0 — 2026-07-19（sweet-spot-driven rewrite）

> 由 Sophia (CPO) for Sean 撰寫、Alan (CTO) 對接
> 詳見舊版 `PRD/SPEC.md` v3.0.0 完整文件（已收錄到 git history）

### Added
- 完整 v3.0.0 規格書（CLI 工具 + 開源定位、24 條 AC、Pivot to Open Source）
- 新聞 RSS + 敏感詞過濾 + 中文押韻 prompt 生成（純 CLI / Node 18+）
- 從 6 個 SaaS 功能砍到 2 個核心

### Changed
- 目標市場：中文 Podcast 實驗創作者 + 中文饒舌創作者
- 變現策略：完全開源 MIT + 零變現（純作品集）

---

## v2.0.0 — 2026-XX（純前端 Boom Bap Rap 生成器）

### Added
- Next.js 16 + React 19 + Tailwind v4 純前端架構
- `app/lib/lyrics.ts` — 規則式押韻歌詞生成（無 LLM）
- `app/lib/audioEngine.ts` — Web Audio API drum + bass synth + WAV 輸出
- 3 種風格：Boom Bap / Trap / Lo-fi
- 敏感詞過濾（內建 22 字政治詞庫）
- `speechSynthesis` TTS 播放
- WAV 匯出（OfflineAudioContext + 手寫 RIFF header）

### Pivot Reason
v0.3 卡在 Replicate API key（提醒 21 次）、v1.0 完全沒落地。v2.0 砍掉所有外部依賴（Replicate / OpenAI / 後端 API），全走瀏覽器內建 API。

---

## v0.3 / v1.0 — 2026-XX（廢棄）

- v0.3：Replicate API + 後端 STT/TTS → 因 API key 取得問題廢棄
- v1.0：後端 + 前端分離架構 → 過度工程、從未部署
