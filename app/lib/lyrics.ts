// ─── Boom Bap Rap Lyrics Generator (rule-based, no LLM) ─────────────────
// Pure JS: split news → rhyme scheme + chunking → add hip-hop flavor

// CJK rhyme endings — simplified rhyme sets
const RHYME_SETS: Record<string, string[]> = {
  'ANG': ['ang', 'iang', 'uang', 'iang'],   // 想 / 亮 / 狀 / 強
  'ING': ['ing', 'eng', 'ung'],
  'OU': ['ou', 'iu', 'u'],
  'AI': ['ai', 'ei', 'ui'],
  'AN': ['an', 'ian', 'uan'],
  'IAO': ['iao', 'ao', 'ou'],
  'EI': ['ei', 'ui', 'ai'],
}

function detectRhymeEnding(char: string): keyof typeof RHYME_SETS {
  if (!char) return 'ANG'
  const lower = char.toLowerCase()
  if ('ang iang uang'.split(' ').some((s) => lower.endsWith(s))) return 'ANG'
  if ('ing eng ung'.split(' ').some((s) => lower.endsWith(s))) return 'ING'
  if ('ai ei ui'.split(' ').some((s) => lower.endsWith(s))) return 'AI'
  if ('an ian uan'.split(' ').some((s) => lower.endsWith(s))) return 'AN'
  if ('iao ao ou'.split(' ').some((s) => lower.endsWith(s))) return 'IAO'
  return 'ANG' // default
}

const SENSITIVE_KEYWORDS = [
  '總統', '選舉', '戰爭', '軍事', '國防', '槍', '炸彈', '抗議',
  '遊行', '罷工', '確診', '死亡', '屍體', '災難', '暗殺', '墜機',
  '自殺', '槍擊', '恐怖', 'ISIS', '戰機', '火箭',
]

/**
 * Filter sensitive words. Replace with [TOPIC] placeholder.
 */
export function filterSensitive(text: string, enabled = true): { filtered: string; hits: string[] } {
  if (!enabled) return { filtered: text, hits: [] }
  const hits: string[] = []
  let filtered = text
  for (const kw of SENSITIVE_KEYWORDS) {
    if (filtered.includes(kw)) {
      hits.push(kw)
      filtered = filtered.split(kw).join('[TOPIC]')
    }
  }
  return { filtered, hits }
}

/**
 * Split news text into ~4-chunk rhyme scheme groups.
 */
function chunkForRhyme(text: string, targetLines = 8): string[][] {
  // Strip punctuation, keep Chinese/English chars
  const cleaned = text.replace(/[\s\n\r，。！？、；：「」『』（）()\[\]【】—,.!?;:"'\-]+/g, ' ')
    .trim()
  const chunks: string[] = []
  let buf = ''
  for (const ch of cleaned) {
    buf += ch
    if (buf.length >= 4) {
      chunks.push(buf)
      buf = ''
    }
  }
  if (buf) chunks.push(buf)

  // Group into pairs (for rhyme AA BB CC DD)
  const groups: string[][] = []
  for (let i = 0; i < chunks.length; i += 2) {
    const pair = chunks.slice(i, i + 2)
    if (pair.length === 2) groups.push(pair)
  }
  return groups.slice(0, targetLines / 2)
}

/**
 * Generate rap lyrics from news content.
 * Algorithm: chunk + add Boom Bap flavor per line.
 */
export function generateRapLyrics(newsText: string, filterSensitiveEnabled = true): {
  verses: string[]
  filteredHits: string[]
} {
  const { filtered, hits } = filterSensitive(newsText, filterSensitiveEnabled)
  if (!filtered || filtered.length < 4) {
    return { verses: [], filteredHits: hits }
  }

  const groups = chunkForRhyme(filtered, 8)
  if (groups.length === 0) return { verses: [], filteredHits: hits }

  const openers = ['Yo,', 'Hey,', 'Yo yo,', 'Listen,']
  const closers = ['(新聞結束)', 'Yo, 事實就是這樣', 'Yo, 看清楚了嗎', '新聞到此為止']

  const verses: string[] = []

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    const first = group[0] || ''
    const second = group[1] || ''
    const opener = i === 0 ? `${openers[Math.floor(Math.random() * openers.length)]} 各位觀眾注意` : '然後'
    const line = `${opener}：${first}，${second}${closers[i] && i === groups.length - 1 ? '。' + closers[i] : '！'}`
    verses.push(line)
  }

  return { verses, filteredHits: hits }
}

/**
 * Get TTS-friendly script for synthesis (one continuous string).
 */
export function versesToScript(verses: string[]): string {
  return verses.join(' ')
}
