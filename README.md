# 新聞 → Rap 自動化 v2.0

純前端、零 API Key 的新聞 → Boom Bap Rap 音樂生成器。

## 為什麼 v2.0？
v0.3 曾卡在 Replicate API key（Sean 提醒 21 次），v1.0 完全沒落地。v2.0 砍掉所有外部依賴：

- TTS → 瀏覽器內建 `window.speechSynthesis`
- 音樂合成 → 瀏覽器內建 `Web Audio API` (drum + bass synth)
- WAV 輸出 → `OfflineAudioContext` + 手寫 WAV header

## 技術棧
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- 純前端，無 backend

## 開發
```bash
npm install
npm run dev
```

## 部署
Push to `main` branch 會自動觸發 Vercel Hobby deploy。
`vercel.json` 已設定 `framework: nextjs`。

## 完整規格書
見 Notion subpage。

## License
Private — OpenClaw Project
