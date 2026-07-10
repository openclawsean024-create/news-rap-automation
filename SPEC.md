# 新聞 → Rap 音樂 自動化系統 — 規格計劃書 v1.0

> 版本：v1.0｜更新日期：2026-07-11｜維護者：Sophia (CPO)
> 對接技術：Alan (CTO)

---

## 1. 問題陳述

### 1.1 目標使用者

| 族群 | 規模 | 痛點 |
|---|---|---|
| 內容創作者（Podcast / YouTube） | ~5 萬 | 想用新聞素材但剪輯成本高、需要每天產出 |
| 社群小編（FB / IG） | ~10 萬 | 想跟上時事話題但自己寫不出來、AI 工具昂貴 |
| 行銷公司 | ~3,000 | 客戶要快速產出新聞素材，但真人編曲需 2-3 天 |
| 個人娛樂 | 不限 | 想把今日新聞變成饒舌歌，純娛樂 |

### 1.2 為什麼不做替代方案

- **商用 AI 音樂（Suno/Udio）**：每次 1-5 USD、月費 30 USD 起，量產成本高
- **真人編曲**：每次 5,000-20,000 NT$，3-5 天交件
- **現有新聞摘要工具**：純文字無音樂
- **我們的解法**：News RSS → 敏感詞過濾 → LLM 濃縮 → Boom Bap Prompt → 純前端 Web Audio + Web Speech API，零月費

---

## 2. 解決方案

### 2.1 核心價值主張

> 「把今天的頭條變成 60 秒饒舌歌，純前端零 API key 完成。」

### 2.2 使用者流程

1. 選擇新聞來源（5+ 預載 RSS：BBC/Reuters/CNN/中央社/自由）
2. 系統抓取最新 10 則頭條，敏感詞過濾
3. LLM 濃縮為 60 秒歌詞（押韻 + 節奏標記）
4. Web Speech API 轉語音（中文/英文混合）
5. Web Audio API 套用 Boom Bap beat 預製
6. 一鍵下載 MP3 + 分享連結

---

## 3. 功能清單

### 3.1 MVP（必做）

- [ ] 5 個預載新聞 RSS 源（BBC/Reuters/CNN/中央社/自由）
- [ ] 敏感詞過濾器（政治/色情/暴力詞庫）
- [ ] LLM 歌詞生成（押韻 + 節奏標記）
- [ ] Web Speech API 轉語音（zh-TW + en-US）
- [ ] 預製 Boom Bap beat（3 種風格）
- [ ] 音訊合併 + MP3 下載
- [ ] 歷史記錄（最近 20 則）

### 3.2 v2（加值）

- [ ] 自訂 beat 上傳
- [ ] 多 LLM 選擇（GPT / Claude / Gemini）
- [ ] 自動發布到 Podcast 平台
- [ ] 多語言歌詞（中/英/日）

### 3.3 明確不做

- 即時新聞（純 RSS 抓取，每天一次）
- 商業新聞（有版權爭議）
- 與 Spotify / Apple Music 直接整合（v3 規劃）
- 多人協作編曲

---

## 4. 技術棧

| 層 | 選擇 | 理由 |
|---|---|---|
| 前端 | Next.js 14 + TypeScript | 純前端為主 |
| RSS 解析 | rss-parser | 業界標準 |
| LLM | OpenAI GPT-4o-mini（成本考量） | 用量預算可控 |
| 語音 | Web Speech API (browser native) | 零 API key |
| 音訊合成 | Web Audio API + lamejs (MP3 編碼) | 純前端 |
| 部署 | Vercel |

---

## 5. 完成標準（Definition of Done）

- [ ] Vercel production URL（https://news-rap-automation.vercel.app）200 OK
- [ ] GitHub Repo 公開（https://github.com/openclawsean024-create/news-rap-automation）
- [ ] 5 個 RSS 源可抓取（測成功抓取 10 則）
- [ ] 敏感詞過濾可運作
- [ ] 60 秒饒舌歌詞生成 + 韻腳標記
- [ ] Web Speech API 中文發音正確
- [ ] MP3 下載檔案可播放

---

## 6. 風險與決策

| 風險 | 等級 | 緩解 |
|---|---|---|
| 新聞版權爭議（RSS 轉發） | 🟠 中 | 僅引用標題 + 摘要、不存全文；附原始來源連結 |
| LLM 成本 | 🟠 中 | GPT-4o-mini 限制 + 用戶用量配額 |
| Web Speech API 中文品質 | 🟡 低 | 提供多種聲音選擇 |
| 敏感內容法律風險（政治新聞） | 🔴 高 | 嚴格敏感詞庫 + 人工審核機制 + 免責聲明 |

---

## 7. 變現路徑

| 方案 | 價格 | 功能 |
|---|---|---|
| 免費版 | NT$0 | 每天 1 則 + 預設 3 種 beat |
| 內容創作者版 | NT$299/月 | 每天 5 則 + 10 種 beat + 歷史 100 則 |
| 行銷公司版 | NT$1,499/月 | 創作者版 + 多用戶 + API + Podcast 發布 |
| 企業版 | NT$4,999/月 | 行銷公司版 + 自訂 LLM + 品牌專屬 beat + 客服優先 |

---

*本規格書版本：v1.0 — 2026-07-11*