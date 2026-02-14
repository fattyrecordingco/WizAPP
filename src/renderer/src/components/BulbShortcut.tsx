import BrightnessSlider from '@components/ui/BrightnessSlider'
import PowerButton from '@components/ui/PowerButton'
import { useBulbStore } from '@renderer/context/BulbStore'

export default function BulbShortcut() {
  const activeBulb = useBulbStore((state) => state.activeBulb)
  const toggleBulb = useBulbStore((state) => state.toggleBulb)

  if (!activeBulb) return null

  return (
    <div className="text-white px-4 py-2 bg-secondary rounded-xl animate-steps-modern animate-pulse-fade-in">
      <div className="flex justify-between items-center">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap">{activeBulb.name}</p>
        <PowerButton isOn={activeBulb.state} onToggle={toggleBulb} />
      </div>
      <BrightnessSlider />
    </div>
  )
}
