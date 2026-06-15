import Button from '@renderer/components/ui/Button'
import { useBulbStore } from '@renderer/context/BulbStore'
import { LightSyncFrame, LightSyncMode, LightSyncSource } from '@shared/types/lightSync'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LuActivity,
  LuAudioLines,
  LuCircleDot,
  LuMonitor,
  LuMusic,
  LuPlay,
  LuRefreshCcw,
  LuSparkles,
  LuSquare,
  LuZap
} from 'react-icons/lu'

type SyncStatus = 'idle' | 'running' | 'error'

type SyncModeOption = {
  mode: LightSyncMode
  icon: ReactNode
}

type AudioCaptureSource = {
  id: string
  label: string
  type: 'output' | 'input'
}

const SYSTEM_OUTPUT_ID = 'system-output'

const MUSIC_MODES: SyncModeOption[] = [
  { mode: 'music-pulse', icon: <LuActivity size={20} /> },
  { mode: 'music-spectrum', icon: <LuSparkles size={20} /> },
  { mode: 'music-prism', icon: <LuZap size={20} /> },
  { mode: 'music-bass', icon: <LuAudioLines size={20} /> },
  { mode: 'music-warm', icon: <LuMusic size={20} /> }
]

const SCREEN_MODES: SyncModeOption[] = [
  { mode: 'screen-average', icon: <LuMonitor size={20} /> },
  { mode: 'screen-vibrant', icon: <LuSparkles size={20} /> },
  { mode: 'screen-edges', icon: <LuCircleDot size={20} /> },
  { mode: 'screen-punchy', icon: <LuZap size={20} /> }
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')

const rgbToHex = (r: number, g: number, b: number): `#${string}` => `#${toHex(r)}${toHex(g)}${toHex(b)}`

const hexToRgb = (color: `#${string}`) => ({
  r: parseInt(color.slice(1, 3), 16),
  g: parseInt(color.slice(3, 5), 16),
  b: parseInt(color.slice(5, 7), 16)
})

const hslToHex = (hue: number, saturation: number, lightness: number): `#${string}` => {
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = lightness - c / 2
  const [r, g, b] =
    hue < 60
      ? [c, x, 0]
      : hue < 120
        ? [x, c, 0]
        : hue < 180
          ? [0, c, x]
          : hue < 240
            ? [0, x, c]
            : hue < 300
              ? [x, 0, c]
              : [c, 0, x]

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}

export default function Sync() {
  const { t } = useTranslation()
  const bulb = useBulbStore((state) => state.bulb)
  const [mode, setMode] = useState<LightSyncMode>('music-pulse')
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [error, setError] = useState('')
  const [sensitivity, setSensitivity] = useState(65)
  const [brightness, setBrightness] = useState(85)
  const [tempo, setTempo] = useState(55)
  const [screenSources, setScreenSources] = useState<LightSyncSource[]>([])
  const [selectedScreenSourceId, setSelectedScreenSourceId] = useState('')
  const [audioSources, setAudioSources] = useState<AudioCaptureSource[]>([
    { id: SYSTEM_OUTPUT_ID, label: t('sync.audio.system'), type: 'output' }
  ])
  const [selectedAudioSourceId, setSelectedAudioSourceId] = useState(SYSTEM_OUTPUT_ID)
  const [preview, setPreview] = useState<LightSyncFrame>({
    mode: 'music-pulse',
    color: '#38bdf8',
    brightness: 60
  })

  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastFrameAtRef = useRef(0)
  const hueRef = useRef(190)
  const energyRef = useRef(0)
  const beatRef = useRef(0.08)
  const lastBeatAtRef = useRef(0)
  const smoothRef = useRef({ r: 56, g: 189, b: 248, brightness: 60 })

  const isMusicMode = mode.startsWith('music')
  const modeOptions = isMusicMode ? MUSIC_MODES : SCREEN_MODES
  const selectedScreenSource =
    screenSources.find((source) => source.id === selectedScreenSourceId) ?? screenSources[0]

  const loadScreenSources = async () => {
    const nextSources = await window.api.getSyncSources()
    setScreenSources(nextSources)
    setSelectedScreenSourceId((current) => {
      if (nextSources.some((source) => source.id === current)) return current
      return nextSources[0]?.id ?? ''
    })
    return nextSources
  }

  const loadAudioSources = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const inputs = devices
      .filter((device) => device.kind === 'audioinput')
      .map((device, index) => ({
        id: device.deviceId,
        label: device.label || `${t('sync.audio.input')} ${index + 1}`,
        type: 'input' as const
      }))

    setAudioSources([
      { id: SYSTEM_OUTPUT_ID, label: t('sync.audio.system'), type: 'output' },
      ...inputs
    ])
  }

  useEffect(() => {
    loadAudioSources()
    loadScreenSources()
  }, [])

  const stopSync = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    audioContextRef.current?.close()
    audioContextRef.current = null
    analyserRef.current = null
    videoRef.current = null
    canvasRef.current = null
    setStatus('idle')
  }

  useEffect(() => stopSync, [])

  const sendFrame = (frame: LightSyncFrame) => {
    const rgb = hexToRgb(frame.color)
    const previous = smoothRef.current
    const colorWeight = mode.startsWith('music') ? 0.42 : 0.28
    const brightnessWeight = 0.5
    const smoothed = {
      r: previous.r + (rgb.r - previous.r) * colorWeight,
      g: previous.g + (rgb.g - previous.g) * colorWeight,
      b: previous.b + (rgb.b - previous.b) * colorWeight,
      brightness: previous.brightness + (frame.brightness - previous.brightness) * brightnessWeight
    }

    smoothRef.current = smoothed

    const output = {
      mode: frame.mode,
      color: rgbToHex(smoothed.r, smoothed.g, smoothed.b),
      brightness: smoothed.brightness
    }

    setPreview(output)
    window.api.applySyncFrame(output)
  }

  const createAudioFrame = (
    analyser: AnalyserNode,
    frequencyData: Uint8Array<ArrayBuffer>,
    timeData: Uint8Array<ArrayBuffer>
  ): LightSyncFrame => {
    analyser.getByteFrequencyData(frequencyData)
    analyser.getByteTimeDomainData(timeData)

    const third = Math.floor(frequencyData.length / 3)
    const average = (start: number, end: number) => {
      let total = 0
      for (let index = start; index < end; index++) total += frequencyData[index]
      return total / Math.max(1, end - start) / 255
    }

    let rmsTotal = 0
    for (let index = 0; index < timeData.length; index++) {
      const centered = (timeData[index] - 128) / 128
      rmsTotal += centered * centered
    }

    const low = average(0, third)
    const mid = average(third, third * 2)
    const high = average(third * 2, frequencyData.length)
    const rms = Math.sqrt(rmsTotal / timeData.length)
    const rawEnergy = clamp((low * 0.42 + mid * 0.28 + high * 0.14 + rms * 0.8) * (sensitivity / 48), 0, 1)
    energyRef.current = energyRef.current * 0.74 + rawEnergy * 0.26
    beatRef.current = beatRef.current * 0.94 + rawEnergy * 0.06

    const now = performance.now()
    const isBeat = rawEnergy > beatRef.current * 1.28 && now - lastBeatAtRef.current > 240
    if (isBeat) lastBeatAtRef.current = now

    const energy = clamp(energyRef.current + (isBeat ? 0.22 : 0), 0, 1)
    const outputBrightness = clamp(8 + energy * brightness + (isBeat ? 14 : 0), 1, 100)

    if (mode === 'music-spectrum') {
      const r = 60 + low * 195
      const g = 35 + mid * 220
      const b = 80 + high * 175
      return { mode, color: rgbToHex(r, g, b), brightness: outputBrightness }
    }

    if (mode === 'music-prism') {
      hueRef.current = (hueRef.current + 2.5 + energy * 16 + (isBeat ? 42 : 0)) % 360
      return {
        mode,
        color: hslToHex(hueRef.current, 1, 0.42 + energy * 0.16),
        brightness: outputBrightness
      }
    }

    if (mode === 'music-bass') {
      const hue = 286 + low * 72 + (isBeat ? 42 : 0)
      return {
        mode,
        color: hslToHex(hue % 360, 0.95, 0.34 + clamp(low + energy, 0, 1) * 0.18),
        brightness: clamp(10 + (low * 0.8 + energy * 0.2) * brightness + (isBeat ? 18 : 0), 1, 100)
      }
    }

    if (mode === 'music-warm') {
      const warmth = 28 + energy * 28
      return {
        mode,
        color: hslToHex(warmth, 0.95, 0.42 + energy * 0.18),
        brightness: outputBrightness
      }
    }

    hueRef.current = (hueRef.current + 1.8 + energy * 10 + (isBeat ? 18 : 0)) % 360
    return {
      mode,
      color: hslToHex(hueRef.current, 0.9, 0.45 + energy * 0.12),
      brightness: outputBrightness
    }
  }

  const createScreenFrame = (video: HTMLVideoElement, canvas: HTMLCanvasElement): LightSyncFrame => {
    const width = 96
    const height = Math.max(54, Math.round(width / (video.videoWidth / video.videoHeight || 16 / 9)))
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return preview

    ctx.drawImage(video, 0, 0, width, height)
    const pixels = ctx.getImageData(0, 0, width, height).data
    let r = 0
    let g = 0
    let b = 0
    let count = 0
    let strongest = { r: 0, g: 0, b: 0, score: 0 }

    for (let index = 0; index < pixels.length; index += 16) {
      const pixelIndex = index / 4
      const x = pixelIndex % width
      const y = Math.floor(pixelIndex / width)
      const edge = x < 12 || x > width - 13 || y < 7 || y > height - 8
      const red = pixels[index]
      const green = pixels[index + 1]
      const blue = pixels[index + 2]
      const max = Math.max(red, green, blue)
      const min = Math.min(red, green, blue)
      const saturation = max === 0 ? 0 : (max - min) / max
      const luminance = (red + green + blue) / 3

      if (mode === 'screen-edges' && !edge) continue
      if (mode === 'screen-vibrant' && (saturation < 0.18 || luminance < 32)) continue

      const score = saturation * 0.72 + (luminance / 255) * 0.28
      if ((mode === 'screen-punchy' || mode === 'screen-vibrant') && score > strongest.score) {
        strongest = { r: red, g: green, b: blue, score }
      }

      r += red
      g += green
      b += blue
      count++
    }

    if (!count) return preview

    const red = r / count
    const green = g / count
    const blue = b / count
    const finalColor =
      mode === 'screen-punchy' && strongest.score > 0.28
        ? { r: strongest.r, g: strongest.g, b: strongest.b }
        : { r: red, g: green, b: blue }
    const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255

    return {
      mode,
      color: rgbToHex(finalColor.r, finalColor.g, finalColor.b),
      brightness: clamp(14 + luminance * brightness, 1, 100)
    }
  }

  const runLoop = () => {
    const interval = 720 - tempo * 5.2
    const now = performance.now()

    if (now - lastFrameAtRef.current >= interval) {
      lastFrameAtRef.current = now

      if (mode.startsWith('music') && analyserRef.current) {
        const frequencyData = new Uint8Array(new ArrayBuffer(analyserRef.current.frequencyBinCount))
        const timeData = new Uint8Array(new ArrayBuffer(analyserRef.current.fftSize))
        sendFrame(createAudioFrame(analyserRef.current, frequencyData, timeData))
      }

      if (mode.startsWith('screen') && videoRef.current) {
        const canvas = canvasRef.current ?? document.createElement('canvas')
        canvasRef.current = canvas
        sendFrame(createScreenFrame(videoRef.current, canvas))
      }
    }

    animationRef.current = requestAnimationFrame(runLoop)
  }

  const startAudioSync = async () => {
    if (selectedAudioSourceId === SYSTEM_OUTPUT_ID) {
      const sources = screenSources.length ? screenSources : await loadScreenSources()
      const source = sources[0]
      if (!source) throw new Error(t('sync.errors.noSource'))

      return navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id
          }
        },
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
            maxFrameRate: 1
          }
        }
      } as unknown as MediaStreamConstraints)
    }

    return navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: selectedAudioSourceId } },
      video: false
    })
  }

  const startScreenSync = async () => {
    if (!selectedScreenSource) throw new Error(t('sync.errors.noSource'))

    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: selectedScreenSource.id,
          maxFrameRate: 30
        }
      }
    } as unknown as MediaStreamConstraints)
  }

  const startSync = async () => {
    stopSync()
    setError('')

    try {
      const stream = isMusicMode ? await startAudioSync() : await startScreenSync()
      streamRef.current = stream

      if (stream.getVideoTracks().length > 0) {
        const video = document.createElement('video')
        video.srcObject = stream
        video.muted = true
        await video.play()
        videoRef.current = video
      }

      if (isMusicMode) {
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length === 0) throw new Error(t('sync.errors.noAudio'))

        const AudioContextClass =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const audioContext = new AudioContextClass()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        audioContext.createMediaStreamSource(stream).connect(analyser)
        audioContextRef.current = audioContext
        analyserRef.current = analyser
        await loadAudioSources()
      }

      setStatus('running')
      runLoop()
    } catch (error) {
      stopSync()
      setStatus('error')
      setError(error instanceof Error ? error.message : t('sync.errors.capture'))
    }
  }

  const selectMode = (nextMode: LightSyncMode) => {
    setMode(nextMode)
    if (status === 'running') stopSync()
  }

  const renderModeButton = ({ mode: optionMode, icon }: SyncModeOption) => (
    <button
      key={optionMode}
      className={`h-24 rounded-md border px-4 text-left transition-colors cursor-pointer ${
        mode === optionMode
          ? 'border-blue-400 bg-blue-500/20 text-white'
          : 'border-secondary-400 bg-secondary-400/40 text-neutral-300 hover:bg-secondary-400/70'
      }`}
      onClick={() => selectMode(optionMode)}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span className="font-semibold">{t(`sync.modes.${optionMode}.title`)}</span>
      </span>
      <span className="mt-2 block text-sm text-neutral-400">{t(`sync.modes.${optionMode}.tone`)}</span>
    </button>
  )

  return (
    <section className="py-8 px-8 w-full">
      <div className="flex items-start justify-between gap-8">
        <div>
          <h1 className="font-bold text-4xl">{t('sync.title')}</h1>
          <h2 className="text-sm lg:text-lg mt-3 text-neutral-400 font-medium">
            {t('sync.subtitle')}
          </h2>
        </div>
        <div className="flex items-center gap-3 rounded-md bg-secondary px-4 py-3">
          <span
            className="block size-10 rounded-md border border-white/10"
            style={{ backgroundColor: preview.color, opacity: preview.brightness / 100 }}
          />
          <div>
            <p className="text-xs uppercase text-neutral-500">{t('sync.preview')}</p>
            <p className="font-semibold">{Math.round(preview.brightness)}%</p>
          </div>
        </div>
      </div>

      <article className="mt-10 grid max-w-5xl grid-cols-[1fr_18rem] gap-8">
        <div className="space-y-8">
          <div>
            <p className="mb-3 text-sm font-semibold text-neutral-400">{t('sync.source')}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`flex items-center justify-center gap-3 rounded-md px-4 py-4 font-semibold transition-colors cursor-pointer ${
                  isMusicMode ? 'bg-blue-600 text-white' : 'bg-secondary text-neutral-300'
                }`}
                onClick={() => selectMode('music-pulse')}
              >
                <LuMusic size={20} />
                {t('sync.sources.music')}
              </button>
              <button
                className={`flex items-center justify-center gap-3 rounded-md px-4 py-4 font-semibold transition-colors cursor-pointer ${
                  !isMusicMode ? 'bg-blue-600 text-white' : 'bg-secondary text-neutral-300'
                }`}
                onClick={() => selectMode('screen-average')}
              >
                <LuMonitor size={20} />
                {t('sync.sources.screen')}
              </button>
            </div>
          </div>

          {isMusicMode ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-400">{t('sync.audio.title')}</p>
                <button
                  className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white cursor-pointer"
                  onClick={loadAudioSources}
                >
                  <LuRefreshCcw size={16} />
                  {t('sync.refresh')}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {audioSources.map((source) => (
                  <button
                    key={source.id}
                    className={`rounded-md border px-4 py-4 text-left transition-colors cursor-pointer ${
                      selectedAudioSourceId === source.id
                        ? 'border-blue-400 bg-blue-500/20 text-white'
                        : 'border-secondary-400 bg-secondary-400/40 text-neutral-300 hover:bg-secondary-400/70'
                    }`}
                    onClick={() => {
                      setSelectedAudioSourceId(source.id)
                      if (status === 'running') stopSync()
                    }}
                  >
                    <span className="block font-semibold">{source.label}</span>
                    <span className="mt-1 block text-sm text-neutral-400">
                      {source.type === 'output' ? t('sync.audio.output') : t('sync.audio.input')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-400">{t('sync.display')}</p>
                <button
                  className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white cursor-pointer"
                  onClick={loadScreenSources}
                >
                  <LuRefreshCcw size={16} />
                  {t('sync.refresh')}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {screenSources.map((source) => (
                  <button
                    key={source.id}
                    className={`overflow-hidden rounded-md border text-left transition-colors cursor-pointer ${
                      selectedScreenSource?.id === source.id
                        ? 'border-blue-400 bg-blue-500/20'
                        : 'border-secondary-400 bg-secondary-400/40 hover:bg-secondary-400/70'
                    }`}
                    onClick={() => {
                      setSelectedScreenSourceId(source.id)
                      if (status === 'running') stopSync()
                    }}
                  >
                    <img src={source.thumbnail} alt="" className="h-24 w-full object-cover" />
                    <span className="block px-3 py-2 text-sm font-semibold text-white">
                      {source.name}
                    </span>
                  </button>
                ))}
              </div>
              {screenSources.length === 0 && (
                <p className="rounded-md bg-secondary p-4 text-sm text-red-300">
                  {t('sync.errors.noSource')}
                </p>
              )}
            </div>
          )}

          <div>
            <p className="mb-3 text-sm font-semibold text-neutral-400">{t('sync.mode')}</p>
            <div className="grid grid-cols-2 gap-3">{modeOptions.map(renderModeButton)}</div>
          </div>
        </div>

        <aside className="rounded-md bg-secondary p-5">
          <div className="space-y-6">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-300">
                {t('sync.controls.sensitivity')}
              </span>
              <input
                type="range"
                min={10}
                max={100}
                value={sensitivity}
                onChange={(event) => setSensitivity(Number(event.target.value))}
                className="w-full accent-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-300">
                {t('sync.controls.brightness')}
              </span>
              <input
                type="range"
                min={15}
                max={100}
                value={brightness}
                onChange={(event) => setBrightness(Number(event.target.value))}
                className="w-full accent-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-300">
                {t('sync.controls.tempo')}
              </span>
              <input
                type="range"
                min={10}
                max={100}
                value={tempo}
                onChange={(event) => setTempo(Number(event.target.value))}
                className="w-full accent-blue-500"
              />
            </label>

            <Button
              variant={status === 'running' ? 'danger' : 'success'}
              fullWidth
              disabled={!bulb}
              onClick={status === 'running' ? stopSync : startSync}
              className="flex items-center justify-center gap-2"
            >
              {status === 'running' ? <LuSquare size={18} /> : <LuPlay size={18} />}
              {status === 'running' ? t('sync.stop') : t('sync.start')}
            </Button>

            <div className="rounded-md bg-main-bg p-3 text-sm">
              <p className="font-semibold text-neutral-300">{t(`sync.status.${status}`)}</p>
              {!bulb && <p className="mt-1 text-red-300">{t('sync.errors.noBulb')}</p>}
              {error && <p className="mt-1 text-red-300">{error}</p>}
            </div>
          </div>
        </aside>
      </article>
    </section>
  )
}
