import { LuLoaderCircle } from 'react-icons/lu'
import Card from './ui/Card'

export default function SearchBulbCard() {
  return (
    <Card className="w-48 h-31 flex flex-col items-center justify-center py-3 px-4">
      <span className="animate-spin-clockwise animate-iteration-count-infinite animate-steps-modern animate-duration-800">
        <LuLoaderCircle size={36} />
      </span>
      <p className="mt-2 text-lg">Searching bulbs</p>
    </Card>
  )
}
