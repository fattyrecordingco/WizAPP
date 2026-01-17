import { BulbConfig } from '@/types/bulbConfig'
import { systemConfig } from '@/types/systemConfig'
import { CONFIG, DISCOVER_TIMEOUT } from '@constants'
import { Bulb, discover, SCENES } from '@lib/wikari/src/mod'
import { MAX_DEFAULT_COLORS } from '@shared/constants'
import { BulbState } from '@shared/types/bulbState'
import { BrowserWindow } from 'electron'
import log from 'electron-log'
import fs from 'fs'

/**
    Decorator that updates the view after the method is executed.
    Also catches if the connection is lost.
*/
function needsViewUpdate(actionName: string) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: never[]) {
      const instance = this as BulbManager
      try {
        log.info('Bulb toggled')
        await originalMethod.apply(this, args)
        instance.window.webContents.send('on-update-bulb', instance.bulbState)
      } catch {
        log.error(`Failed to ${actionName}, connection lost`)
        await instance.reconnectBulb()
      }
    }
  }
}

class BulbManager {
  private bulb: Bulb | null
  // Bulb state is the state of the bulb that is sent to the renderer process, it works as a cache to avoid sending requests to the bulb
  public bulbState: BulbState | null
  private appData: BulbConfig | null
  public window: BrowserWindow
  private bulbIP: string | null

  constructor(window: BrowserWindow) {
    this.bulb = null
    this.bulbState = null
    this.appData = null
    this.bulbIP = null

    this.window = window
    this.init()
  }

  private async init() {
    await this.setUpBulb()
  }

  private getConfigData(): BulbConfig {
    let data: BulbConfig
    try {
      data = JSON.parse(fs.readFileSync(CONFIG, 'utf-8'))
      log.info('Config data found with bulb IP: ', data.bulbIp)
    } catch {
      data = {
        bulbIp: '',
        bulbName: '',
        customColors: [],
        favoriteColors: [
          SCENES['Warm White'],
          SCENES['Daylight'],
          SCENES['Night Light'],
          SCENES['Cozy']
        ]
      }
      log.warn('Config data not found, creating new config file...')
    }
    return data
  }

  private async searchBulb(): Promise<Bulb> {
    let isBulbFound = false
    let bulb: Bulb | null = null
    let retryCount = 0
    const MAX_RETRIES = 20
    const RETRY_DELAY_MS = 3000

    while (!isBulbFound && retryCount < MAX_RETRIES) {
      log.info('Looking for bulb')
      // Try with specific IP first if available
      if (this.bulbIP) {
        log.info('Trying to connect to bulb with IP: ', this.bulbIP)
        try {
          const res = await discover({ addr: this.bulbIP, waitMs: DISCOVER_TIMEOUT })

          if (res.length > 0) {
            bulb = res[0]
            isBulbFound = true
            log.info('Bulb found with IP: ', this.bulbIP)
          } else {
            log.warn('Bulb not found with IP: ', this.bulbIP, ' - Will try network discovery')
            this.bulbIP = null
          }
        } catch (error) {
          log.error('Error discovering bulb with IP: ', error)
          this.bulbIP = null
        }
      }

      // If not found with IP, try network discovery
      if (!isBulbFound) {
        try {
          const res = await discover({ waitMs: DISCOVER_TIMEOUT })
          if (res.length > 0) {
            bulb = res[0]
            isBulbFound = true
            log.info('Bulb found via network discovery')
          } else {
            log.error('Bulb not found')
          }
        } catch (error) {
          log.error('Error during network discovery: ', error)
        }
      }

      // Only retry if bulb wasn't found
      if (!isBulbFound) {
        retryCount++
        if (retryCount < MAX_RETRIES) {
          log.info(`Retrying to find bulb (${retryCount}/${MAX_RETRIES})`)
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
        } else {
          log.error('Max retries reached. Could not find bulb.')
          throw new Error('Bulb not found after maximum retries')
        }
      }
    }

    return bulb as Bulb
  }

  private async setUpBulb() {
    try {
      const configData = this.getConfigData()
      this.bulbIP = configData.bulbIp
      this.bulb = await this.searchBulb()

      log.debug('Getting bulb state...')
      const pilot = (await this.bulb.getPilot()).result
      const bulbConfig = (await this.bulb.sendRaw({
        method: 'getSystemConfig',
        env: '',
        params: { mac: '', rssi: 0 }
      })) as systemConfig

      const configResult = bulbConfig.result
      this.bulbState = {
        ...pilot,
        ...configResult,
        ip: this.bulb.address,
        port: this.bulb.bulbPort,
        name: configData && configData.bulbName ? configData.bulbName : configResult.moduleName,
        customColors: configData && configData.customColors ? configData.customColors : [],
        favoriteColors: configData && configData.favoriteColors ? configData.favoriteColors : []
      }

      this.appData = {
        bulbIp: this.bulbState.ip,
        bulbName: this.bulbState.name,
        customColors: this.bulbState.customColors,
        favoriteColors: this.bulbState.favoriteColors
      }
      this.saveConfig()

      log.debug(this.window ? 'Current window is OK' : 'Current windows is NOT DEFINED')
      log.debug(this.bulbState ? 'Bulb state is OK' : 'Bulb state is NOT DEFINED')

      this.window.webContents.send('on-update-bulb', this.bulbState)
      log.info('Sending bulb data to renderer process...')
    } catch (error) {
      log.error('Failed to setup bulb: ', error)
      this.bulbState = null
      this.bulb = null
      this.window.webContents.send('on-update-bulb', this.bulbState)
      throw error
    }
  }

  public async getBulbState() {
    return this.bulbState
  }

  private saveConfig() {
    fs.writeFileSync(CONFIG, JSON.stringify(this.appData))
  }

  private deleteConfig() {
    fs.unlinkSync(CONFIG)
  }

  public async reconnectBulb() {
    // Close existing connection before reconnecting
    if (this.bulb) {
      try {
        this.bulb.closeConnection()
        log.info('Closed previous bulb connection')
      } catch (error) {
        log.warn('Error closing previous connection: ', error)
      }
    }

    this.bulbState = null
    this.bulb = null
    this.window.webContents.send('on-update-bulb', this.bulbState)
    log.info('Reconnecting to bulb...')

    try {
      await this.setUpBulb()
    } catch (error) {
      log.error('Failed to reconnect to bulb: ', error)
    }
  }

  @needsViewUpdate('toggle bulb')
  public async toggleBulb() {
    if (!this.bulbState || !this.bulb) return

    await this.bulb.toggle()
    this.bulbState.state = !this.bulbState.state
  }

  @needsViewUpdate('set brightness')
  public async setBrightness(brightness: number) {
    if (!this.bulbState || !this.bulb) return

    await this.bulb.brightness(brightness)
    this.bulbState.dimming = brightness
  }

  @needsViewUpdate('set bulb name')
  public setBulbName(name: string) {
    if (!this.bulbState || !this.appData) return

    this.bulbState.name = name
    this.appData.bulbName = name
    this.saveConfig()
  }

  public setIp(ip: string) {
    this.bulbIP = ip
  }

  @needsViewUpdate('set scene')
  public async setScene(sceneId: number) {
    if (!this.bulbState || !this.bulb) return

    this.bulbState.state = true
    await this.bulb.scene(sceneId)
    this.bulbState.sceneId = sceneId
  }

  private getCustomColorNewId() {
    if (!this.bulbState) return MAX_DEFAULT_COLORS

    if (this.bulbState.customColors.length === 0) return MAX_DEFAULT_COLORS

    const ids = this.bulbState.customColors.map((color) => color.id)
    return Math.max(...ids) + 1
  }

  @needsViewUpdate('toggle favorite color')
  public async toggleFavoriteColor(colorId: number) {
    if (!this.bulbState || !this.appData) return

    if (this.bulbState.favoriteColors.includes(colorId)) {
      this.bulbState.favoriteColors = this.bulbState.favoriteColors.filter((id) => id !== colorId)
    } else {
      this.bulbState.favoriteColors.push(colorId)
    }

    this.appData.favoriteColors = this.bulbState.favoriteColors
    this.saveConfig()
  }

  @needsViewUpdate('add custom color')
  public async addCustomColor(colorName: string, colorHex: string) {
    if (!this.bulbState || !this.appData) return

    const newId = this.getCustomColorNewId()
    this.bulbState.customColors.push({ id: newId, name: colorName, hex: colorHex })
    this.appData.customColors = this.bulbState.customColors
    this.saveConfig()
  }

  @needsViewUpdate('set custom color')
  public async setCustomColor(colorId: number) {
    if (!this.bulbState || !this.bulb) return

    const color = this.bulbState.customColors.find((c) => c.id === colorId)
    if (!color) return
    this.bulbState.state = true
    this.bulbState.sceneId = colorId
    await this.bulb.color(color.hex as `#${string}`)
  }

  @needsViewUpdate('edit custom color')
  public async editCustomColor(colorId: number, colorName: string, colorHex: string) {
    if (!this.bulbState || !this.appData) return

    const color = this.bulbState.customColors.find((c) => c.id === colorId)
    if (!color) return
    color.name = colorName
    color.hex = colorHex
    this.appData.customColors = this.bulbState.customColors
    this.saveConfig()
  }

  @needsViewUpdate('remove custom color')
  public async removeCustomColor(colorId: number) {
    if (!this.bulbState || !this.appData) return

    this.bulbState.customColors = this.bulbState.customColors.filter((c) => c.id !== colorId)
    this.appData.customColors = this.bulbState.customColors

    this.bulbState.favoriteColors = this.bulbState.favoriteColors.filter((id) => id !== colorId)
    this.appData.favoriteColors = this.bulbState.favoriteColors

    this.saveConfig()
  }

  @needsViewUpdate('delete bulb')
  public deleteBulb() {
    this.bulbState = null
    this.bulb = null
    this.window.webContents.send('on-update-bulb', this.bulbState)
    log.info('Bulb deleted')
    this.saveConfig()
    this.init()
  }

  @needsViewUpdate('set favorite colors order')
  public async setFavoriteColorsOrder(favoriteColors: number[]) {
    if (!this.bulbState || !this.appData) return

    log.info('Setting favorite colors order: ', favoriteColors)
    this.bulbState.favoriteColors = favoriteColors
    this.appData.favoriteColors = favoriteColors
    this.saveConfig()
  }

  @needsViewUpdate('end connection')
  public deleteProfile() {
    this.bulbState = null
    this.bulb = null
    this.appData = null
    this.window.webContents.send('on-update-bulb', this.bulbState)
    log.info('Profile deleted')
    this.deleteConfig()
    this.init()
  }

  public endConnection() {
    if (this.bulb) {
      this.bulb.closeConnection()
      log.info('Connection with bulb closed')
    }
  }
}

export default BulbManager
