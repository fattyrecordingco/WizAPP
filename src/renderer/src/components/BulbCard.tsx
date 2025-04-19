import Card from '@components/ui/Card'
import KebabMenu from '@components/ui/KebabMenu'
import PowerButton from '@components/ui/PowerButton'
import { BulbState } from '@shared/types/bulbState'

type BulbCardProps = {
  bulb: BulbState
  menuItems: {
    icon: JSX.Element
    label: string
    onClick: () => void
  }[]
}

export default function BulbCard({ bulb, menuItems }: BulbCardProps) {
  return (
    <Card
      className="w-48 h-31 py-3 px-4 animate-fade-in animate-steps-modern"
      variant={bulb.state ? 'primary' : 'secondary'}
    >
      <p className="text-lg">{bulb.name}</p>
      <span className="text-neutral-300">{bulb.state ? 'on' : 'off'}</span>

      <div className="mt-4 flex justify-between items-center">
        <PowerButton />
        <KebabMenu items={menuItems} />
      </div>
    </Card>
  )
}
