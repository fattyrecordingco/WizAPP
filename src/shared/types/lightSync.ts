export type LightSyncMode =
  | 'music-pulse'
  | 'music-spectrum'
  | 'music-warm'
  | 'music-prism'
  | 'music-bass'
  | 'screen-average'
  | 'screen-vibrant'
  | 'screen-edges'
  | 'screen-punchy'

export type LightSyncFrame = {
  mode: LightSyncMode
  color: `#${string}`
  brightness: number
}

export type LightSyncSource = {
  id: string
  name: string
  displayId: string
  thumbnail: string
}
