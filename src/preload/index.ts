import { electronAPI } from '@electron-toolkit/preload'
import { BulbState } from '@shared/types/bulbState'
import { LightSyncFrame, LightSyncSource } from '@shared/types/lightSync'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  onUpdateBulb: (callback: (bulb: BulbState) => void) =>
    ipcRenderer.on('on-update-bulb', (_, bulb: BulbState) => callback(bulb)),
  getBulbWhenReady: () => ipcRenderer.invoke('get-bulb'),
  toggleBulb: () => ipcRenderer.send('toggle-bulb-state'),
  setBrightness: (brightness: number) => ipcRenderer.send('set-brightness', brightness),
  setBulbName: (name: string) => ipcRenderer.send('set-bulb-name', name),
  setIp: (ip: string) => ipcRenderer.send('set-ip', ip),
  visitAuthor: () => ipcRenderer.send('visit-author'),
  setScene: (sceneId: number) => ipcRenderer.send('set-scene', sceneId),
  applySyncFrame: (frame: LightSyncFrame) => ipcRenderer.send('apply-sync-frame', frame),
  getSyncSources: (): Promise<LightSyncSource[]> => ipcRenderer.invoke('get-sync-sources'),
  toggleFavoriteColor: (colorId: number) => ipcRenderer.send('toggle-favorite-color', colorId),
  addCustomColor: (colorName: string, colorHex: string) =>
    ipcRenderer.send('add-custom-color', colorName, colorHex),
  setCustomColor: (colorId: number) => ipcRenderer.send('set-custom-color', colorId),
  editCustomColor: (colorId: number, colorName: string, colorHex: string) =>
    ipcRenderer.send('edit-color', colorId, colorName, colorHex),
  removeCustomColor: (colorId: number) => ipcRenderer.send('remove-color', colorId),
  setFavoriteColorsOrder: (favoriteColors: number[]) =>
    ipcRenderer.send('set-favorite-colors-order', favoriteColors),
  openAppFolder: () => ipcRenderer.send('open-app-folder'),
  getLanguage: () => ipcRenderer.invoke('get-language'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  deleteBulb: () => ipcRenderer.send('delete-bulb'),
  deleteProfile: () => ipcRenderer.send('delete-profile')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
