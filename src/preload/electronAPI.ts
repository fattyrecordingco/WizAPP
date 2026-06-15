import { BulbState } from '@shared/types/bulbState'
import { LightSyncFrame, LightSyncSource } from '@shared/types/lightSync'

export interface IElectronAPI {
  onUpdateBulb: (callback: (bulb: BulbState) => void) => void
  getBulbWhenReady: () => Promise<BulbState>
  toggleBulb: () => void
  setBrightness: (brightness: number) => void
  setBulbName: (name: string) => void
  setIp: (ip: string) => void
  visitAuthor: () => void
  setScene: (sceneId: number) => void
  applySyncFrame: (frame: LightSyncFrame) => void
  getSyncSources: () => Promise<LightSyncSource[]>
  addCustomColor: (colorName: string, colorHex: string) => void
  setCustomColor: (colorId: number) => void
  editCustomColor: (colorId: number, colorName: string, colorHex: string) => void
  removeCustomColor: (colorId: number) => void
  getVersion: () => Promise<string>
  deleteBulb: () => void
  deleteProfile: () => void
}
