import { BulbState } from '@shared/types/bulbState'
import { CustomColor } from '@shared/types/customColor'

export interface BulbConfig {
  bulbName: string
  bulbIp: string
  customColors: CustomColor[]
  favoriteColors: Array<BulbState['sceneId']>
}
