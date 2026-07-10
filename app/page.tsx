'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic2, Play, Square, Download, Wand2, Sparkles, Volume2 } from 'lucide-react'
import { generateRapLyrics, versesToScript } from '@/app/lib/lyrics'
import { audioBufferToWav, renderLoop, type DrumStyle } from '@/app/lib/audioEngine'

const SAMPLE_NEWS = `中央社報導，台灣經濟部宣布啟動新一輪 AI 產業補助計畫，預計投入 50 億元協助中小企業導入人工智慧技術，提升產業競爭力。這項計畫涵蓋智慧製造、智慧醫療、智慧金融等領域，預計創造超過 2 萬個就業機會。經濟部長表示，將優先補助具創新技術並能快速落地的廠商。`

const STYLES: { id: DrumStyle; label: string; desc: string }[] = [
  { id: 'boombap', label: 'Old School Boom Bap', desc: '傳統東岸嘻哈，85 BPM 經典節奏' },
  { id: 'trap', label: 'Trap', desc: '現代 trap，hi-hat roll + 重 kick' },
  { id: 'lofi', label: 'Lo-fi 慵懶', desc: '慢版 hip hop，適合 chill 場景' },
]

export default function HomePage() {
  const [newsText, setNewsText] = useState('')
  const [filterEnabled, setFilterEnabled] = useState(true)
  const [bpm, setBpm] = useState(90)
  const [style, setStyle] = useState<DrumStyle>('boombap')
  const [verses, setVerses] = useState<string[]>([])
  const [filteredHits, setFilteredHits] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const ttsTimeoutRef = useRef<number | null>(null)

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
      if (ttsTimeoutRef.current) {
        clearTimeout(ttsTimeoutRef.current)
      }
    }
  }, [])

  const handleGenerate = () => {
    if (!newsText.trim()) return
    setError(null)
    const result = generateRapLyrics(newsText, filterEnabled)
    setVerses(result.verses)
    setFilteredHits(result.filteredHits)
  }

  const handleStop = () => {
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    if (ttsTimeoutRef.current) {
      clearTimeout(ttsTimeoutRef.current)
      ttsTimeoutRef.current = null
    }
    setIsPlaying(false)
    setElapsedTime(0)
  }

  const handlePlay = () => {
    if (verses.length === 0) {
      handleGenerate()
    }
    setError(null)
    setIsPlaying(true)
    setElapsedTime(0)

    try {
      // Init AudioContext (user gesture required)
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const ctx = audioCtxRef.current

      // Render loop synchronously to AudioBuffer then play from buffer
      const offlineCtx = new OfflineAudioContext({
        numberOfChannels: 2,
        length: Math.ceil(ctx.sampleRate * (60 / bpm) * 4 * 8),
        sampleRate: 44100,
      })
      // Schedule loop on offline
      ;(async () => {
        const buffer = await renderLoop(offlineCtx, bpm, style)
        const src = ctx.createBufferSource()
        src.buffer = buffer
        src.connect(ctx.destination)
        src.start()

        // TTS read in parallel
        if ('speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(versesToScript(verses))
          utter.lang = 'zh-TW'
          utter.rate = 1.05
          utter.pitch = 0.95
          window.speechSynthesis.speak(utter)
        }

        // Tick elapsed
        const start = Date.now()
        const tick = setInterval(() => {
          const e = Math.round((Date.now() - start) / 100) / 10
          setElapsedTime(e)
          if (e >= buffer.duration || !audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            clearInterval(tick)
            setIsPlaying(false)
            setElapsedTime(0)
          }
        }, 100)
      })()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '播放失敗'
      setError(msg)
      setIsPlaying(false)
    }
  }

  const handleExportWAV = async () => {
    if (verses.length === 0) {
      handleGenerate()
    }
    setError(null)
    setIsExporting(true)
    setDownloadUrl(null)

    try {
      const offlineCtx = new OfflineAudioContext({
        numberOfChannels: 1,
        length: Math.ceil(44100 * (60 / bpm) * 4 * 8),
        sampleRate: 44100,
      })
      const buffer = await renderLoop(offlineCtx, bpm, style)
      const blob = audioBufferToWav(buffer)
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '匯出失敗'
      setError(msg)
    } finally {
      setIsExporting(false)
    }
  }

  const handleLoadSample = () => setNewsText(SAMPLE_NEWS)

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent via-accent-2 to-accent-hot flex items-center justify-center">
            <Mic2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black">新聞 → Rap 自動化</h1>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
              Boom Bap Generator · Pure Frontend · v2.0
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6 grid lg:grid-cols-[1fr_1fr] gap-6 animate-fade-in">
        {/* LEFT: News → Lyrics */}
        <section className="space-y-4">
          <div className="bg-surface rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider opacity-60">📰 新聞輸入</div>
              <button
                onClick={handleLoadSample}
                className="text-[11px] px-2 py-1 bg-surface-2 rounded text-info hover:bg-surface-2/70"
              >
                載入範例
              </button>
            </div>
            <textarea
              rows={6}
              placeholder="貼上新聞標題 + 摘要…(50-300 字最佳)"
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              className="w-full px-3 py-2 bg-surface-2 rounded-lg border border-white/5 text-sm"
            />
            <div className="text-xs opacity-50">{newsText.length} 字</div>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider opacity-60">
                🎤 Rap 歌詞
              </div>
              <button
                onClick={handleGenerate}
                disabled={!newsText.trim()}
                className="text-[11px] px-3 py-1.5 bg-accent text-white rounded font-bold flex items-center gap-1 hover:bg-cyan-400 transition"
              >
                <Wand2 size={12} /> 生成
              </button>
            </div>
            <div className="min-h-[160px] max-h-[280px] overflow-y-auto space-y-2">
              {verses.length === 0 ? (
                <div className="text-center py-12 opacity-50 text-sm">
                  點「生成」按鈕把新聞轉成 Boom Bap Rap 歌詞
                </div>
              ) : (
                verses.map((v, i) => (
                  <div
                    key={i}
                    className="px-3 py-2.5 bg-surface-2 rounded-lg text-sm leading-relaxed"
                  >
                    <span className="text-accent mr-2">{i + 1}.</span>
                    {v}
                  </div>
                ))
              )}
            </div>
            {filteredHits.length > 0 && (
              <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs">
                ⚠️ 過濾掉 {filteredHits.length} 個敏感詞：
                <span className="font-mono">{filteredHits.join(', ')}</span> → 全部替換為 [TOPIC]
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Music + Controls */}
        <section className="space-y-4">
          {/* Visualizer */}
          <div className="bg-surface rounded-2xl p-6 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider opacity-60">🎶 音樂控制</div>
              <div className="text-xs opacity-50 tabular-nums">
                {isPlaying ? `${elapsedTime.toFixed(1)}s` : '0.0s'}
              </div>
            </div>

            {/* Equalizer visual */}
            <div className={`flex items-center justify-center h-24 bg-surface-2 rounded-xl ${isPlaying ? '' : 'opacity-30'}`}>
              {isPlaying ? (
                <div className="flex items-end h-full py-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className="equalizer-bar h-full" />
                  ))}
                </div>
              ) : (
                <div className="text-xs opacity-50">點 ▶ 後開始播放</div>
              )}
            </div>

            <div className="flex gap-2">
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  disabled={!newsText.trim()}
                  className="flex-1 bg-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-cyan-400 transition"
                >
                  <Play size={16} /> ▶ 生成並播放 (8 小節 30 秒)
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition"
                >
                  <Square size={16} /> ⏹ 停止
                </button>
              )}
            </div>
          </div>

          {/* Style select */}
          <div className="bg-surface rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider opacity-60">🎛 風格</div>
            <div className="grid gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-3 py-2.5 rounded-lg flex items-start gap-3 transition text-left ${
                    style === s.id
                      ? 'bg-accent-2 text-white'
                      : 'bg-surface-2 hover:bg-surface-2/70'
                  }`}
                >
                  <Sparkles size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">{s.label}</div>
                    <div className="text-xs opacity-70">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* BPM slider */}
          <div className="bg-surface rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider opacity-60">
                🎚 速度 (BPM)
              </div>
              <div className="text-2xl font-black text-accent tabular-nums">{bpm}</div>
            </div>
            <input
              type="range"
              min={60}
              max={160}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] opacity-50">
              <span>60 慢</span>
              <span>90 中</span>
              <span>120 標準</span>
              <span>160 瘋</span>
            </div>
          </div>

          {/* Filter toggle */}
          <div className="bg-surface rounded-2xl p-4 border border-white/5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-black uppercase tracking-wider opacity-60">
                🛡 敏感詞過濾
              </span>
              <span
                className={`relative inline-block w-11 h-6 rounded-full transition ${
                  filterEnabled ? 'bg-accent' : 'bg-surface-2'
                }`}
                onClick={() => setFilterEnabled(!filterEnabled)}
              >
                <span
                  className={`absolute top-0.5 left-0.5 inline-block w-5 h-5 rounded-full bg-white transition-transform ${
                    filterEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </span>
            </label>
            <p className="text-[10px] opacity-50 mt-2">
              過濾政治 / 軍事 / 暴力關鍵字，自動替換為 [TOPIC]
            </p>
          </div>

          {/* Export */}
          <div className="bg-surface rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider opacity-60">💾 匯出</div>
            {isExporting ? (
              <div className="text-sm text-center py-3 opacity-70">編碼 WAV 中…</div>
            ) : downloadUrl ? (
              <a
                href={downloadUrl}
                download={`boom-bap-${bpm}bpm-${Date.now()}.wav`}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
              >
                <Download size={16} /> ⬇ 下載 WAV
              </a>
            ) : (
              <button
                onClick={handleExportWAV}
                disabled={!newsText.trim()}
                className="w-full bg-accent-2 hover:bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
              >
                <Download size={16} /> 製作 WAV 檔
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="text-[10px] opacity-50 text-center">
            <Volume2 size={10} className="inline mr-1" />
            純前端 Web Audio API 合成 + Web Speech API 朗讀 — 零 API Key
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-5 py-8 text-xs opacity-50 text-center border-t border-white/5 mt-12">
        新聞 → Rap 自動化 v2.0 — 純前端 Boom Bap 生成器 ｜ 零 API Key
      </footer>
    </div>
  )
}
