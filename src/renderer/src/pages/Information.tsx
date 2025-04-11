import { useBulbStore } from '@renderer/context/BulbStore'
import { useTranslation } from 'react-i18next'
import { LuLightbulb } from 'react-icons/lu'

export default function Information() {
  const bulb = useBulbStore((state) => state.bulb)
  const { t } = useTranslation()

  const renderLabel = (name: string, value: string | number) => (
    <p>
      <span className="font-medium me-2">{name}:</span>
      <span>{value}</span>
    </p>
  )

  const renderCardInfo = () => (
    <article className="mt-14 flex bg-secondary-700 rounded-xl px-6 py-5 flex-col w-fit shadow-lg">
      <div className="flex items-center gap-2">
        <LuLightbulb size={32} strokeWidth={1} />
        <h2 className="text-2xl lg:text-2xl font-semibold">{bulb.name}</h2>
      </div>

      <div className="mt-4 lg:text-lg leading-normal">
        {renderLabel(t('information.moduleName'), bulb.moduleName)}
        {renderLabel(t('information.ip'), bulb.ip)}
        {renderLabel(t('information.port'), bulb.port)}
        {renderLabel(t('information.mac'), bulb.mac)}
        {renderLabel(t('information.state'), bulb.state ? 'ON' : 'OFF')}
        {renderLabel(t('information.sceneId'), bulb.sceneId)}
        {renderLabel(t('information.firmwareVersion'), bulb.fwVersion)}
        {renderLabel(t('information.homeId'), bulb.homeId)}
        {renderLabel(t('information.roomId'), bulb.roomId)}
      </div>
    </article>
  )

  return (
    <section className="py-8 px-8">
      <h1 className="font-bold text-4xl">{t('information.title')}</h1>
      {bulb && renderCardInfo()}
    </section>
  )
}
