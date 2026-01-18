import Card from '@components/ui/Card'
import KebabMenu from '@components/ui/KebabMenu'
import PowerButton from '@components/ui/PowerButton'
import { BulbState } from '@shared/types/bulbState'
import { ReactNode } from 'react'

type BulbCardProps = {
  bulb: BulbState
  menuItems: {
    icon: ReactNode
    label: string
    onClick: () => void
  }[]
}

export default function BulbCard({ bulb, menuItems }: BulbCardProps) {
  return (
    <Card
      className="w-48 h-31 py-3 px-4"
      variant={bulb.state ? 'primary' : 'secondary'}
    >
      <p className="text-lg overflow-hidden text-ellipsis whitespace-nowrap">{bulb.name}</p>
      <span className="text-neutral-300">{bulb.state ? 'on' : 'off'}</span>

      <div className="mt-4 flex justify-between items-center">
        <PowerButton />
        <KebabMenu items={menuItems} />
      </div>
    </Card>
  )
}
