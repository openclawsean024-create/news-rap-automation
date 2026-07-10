// ─── Web Audio Engine — Boom Bap drum + bass synth ───────────────────────

export type DrumStyle = 'boombap' | 'trap' | 'lofi'

/**
 * Schedule one kick hit at `time`.
 */
export function scheduleKick(ctx: AudioContext | OfflineAudioContext, dest: AudioNode, time: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.setValueAtTime(150, time)
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.04)
  gain.gain.setValueAtTime(0.95, time)
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15)
  osc.connect(gain).connect(dest)
  osc.start(time)
  osc.stop(time + 0.2)
}

/**
 * Schedule a snare (white-noise burst).
 */
export function scheduleSnare(ctx: AudioContext | OfflineAudioContext, dest: AudioNode, time: number) {
  const noise = ctx.createBufferSource()
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05))
  }
  noise.buffer = buffer
  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'highpass'
  bandpass.frequency.value = 1200
  const gain = ctx.createGain()
  gain.gain.value = 0.6
  noise.connect(bandpass).connect(gain).connect(dest)
  noise.start(time)
  noise.stop(time + 0.15)
}

/**
 * Schedule hi-hat click (very short noise).
 */
export function scheduleHat(ctx: AudioContext | OfflineAudioContext, dest: AudioNode, time: number, accent = false) {
  const noise = ctx.createBufferSource()
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012))
  }
  noise.buffer = buffer
  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 6000
  const gain = ctx.createGain()
  gain.gain.value = accent ? 0.35 : 0.2
  noise.connect(highpass).connect(gain).connect(dest)
  noise.start(time)
  noise.stop(time + 0.05)
}

/**
 * Schedule a simple bass note (square + lowpass).
 */
export function scheduleBass(ctx: AudioContext | OfflineAudioContext, dest: AudioNode, time: number, freq: number, duration = 0.5) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 200
  osc.type = 'square'
  osc.frequency.setValueAtTime(freq, time)
  gain.gain.setValueAtTime(0, time)
  gain.gain.linearRampToValueAtTime(0.45, time + 0.02)
  gain.gain.linearRampToValueAtTime(0.4, time + duration * 0.7)
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration)
  osc.connect(filter).connect(gain).connect(dest)
  osc.start(time)
  osc.stop(time + duration)
}

/**
 * Render a 30-second loop to an AudioBuffer.
 */
export function renderLoop(ctx: OfflineAudioContext, bpm: number, style: DrumStyle): Promise<AudioBuffer> {
  const beatLen = 60 / bpm
  const barLen = beatLen * 4
  const totalBars = 8
  const startTime = 0

  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = startTime + bar * barLen
    for (let beat = 0; beat < 4; beat++) {
      const t = barStart + beat * beatLen
      if (style === 'boombap') {
        // kick on 1, 3
        if (beat === 0 || beat === 2) scheduleKick(ctx, ctx.destination, t)
        // snare on 2, 4
        if (beat === 1 || beat === 3) scheduleSnare(ctx, ctx.destination, t)
        // hi-hat 8th notes
        for (let e = 0; e < 2; e++) {
          scheduleHat(ctx, ctx.destination, t + (beatLen / 2) * e, e === 0)
        }
        // bass line (E minor progression per bar)
        const root = bar % 4 === 0 ? 41.20 : bar % 4 === 1 ? 49.00 : bar % 4 === 2 ? 55.00 : 46.25 // Em, G, A, F (Hz)
        scheduleBass(ctx, ctx.destination, t, root, beatLen * 0.9)
      } else if (style === 'trap') {
        // Kick on 1, 3 (heavier)
        if (beat === 0 || beat === 2) scheduleKick(ctx, ctx.destination, t)
        // Hi-hat rolls on every 1/8
        for (let e = 0; e < 4; e++) {
          scheduleHat(ctx, ctx.destination, t + (beatLen / 4) * e, e === 0)
        }
        // Snare (less frequent)
        if (beat === 3) scheduleSnare(ctx, ctx.destination, t)
      } else {
        // Lo-fi
        if (beat === 0) scheduleKick(ctx, ctx.destination, t)
        if (beat === 1 || beat === 3) scheduleSnare(ctx, ctx.destination, t)
        for (let e = 0; e < 2; e++) {
          scheduleHat(ctx, ctx.destination, t + (beatLen / 2) * e, false)
        }
      }
    }
  }

  return ctx.startRendering()
}

/**
 * Convert an AudioBuffer to a WAV Blob (16-bit PCM mono).
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const channels = 1
  const sampleRate = buffer.sampleRate
  const samples = buffer.getChannelData(0)
  const length = samples.length

  const wavLength = 44 + length * 2

  const arrayBuffer = new ArrayBuffer(wavLength)
  const view = new DataView(arrayBuffer)

  // RIFF chunk
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + length * 2, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channels * 2, true)
  view.setUint16(32, channels * 2, true)
  view.setUint16(34, 16, true)

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, length * 2, true)

  let offset = 44
  for (let i = 0; i < length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
