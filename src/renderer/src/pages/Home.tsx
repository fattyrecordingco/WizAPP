import BulbCard from '@renderer/components/BulbCard'
import AddDeviceModal from '@renderer/components/modals/AddDeviceModal'
import DeleteDialog from '@renderer/components/modals/DeleteDialog'
import EditNameModal from '@renderer/components/modals/EditNameModal'
import SearchBulbCard from '@renderer/components/SearchBulbCard'
import Button from '@renderer/components/ui/Button'
import { useBulbStore } from '@renderer/context/BulbStore'
import { useBulbMenuItems } from '@renderer/hooks/useMenuItems'
import { HomeModalState, ModalType } from '@renderer/types/modals'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCirclePlus } from 'react-icons/lu'

export default function Home() {
  const { bulb, toggleBulb } = useBulbStore()
  const { t } = useTranslation()
  const [modals, setModals] = useState<HomeModalState>({
    edit: false,
    delete: false,
    ip: false
  })

  const toggleModal = (modal: ModalType) => {
    setModals((prev) => ({ ...prev, [modal]: !prev[modal] }))
  }

  const menuItems = useBulbMenuItems(toggleBulb, toggleModal)

  return (
    <section className="py-8 px-8">
      <h1 className="font-bold text-4xl">{t('home.title')}</h1>

      <article className="mt-14 grid grid-cols-3 gap-8 w-fit">
        {bulb ? <BulbCard bulb={bulb} menuItems={menuItems} /> : <SearchBulbCard />}
        <Button
          variant="secondary"
          onClick={() => toggleModal('ip')}
          className="flex flex-col items-center justify-center w-48 "
        >
          <LuCirclePlus size={32} strokeWidth={1} />
          <p className="mt-2 text-lg">{t('home.add.entry')}</p>
        </Button>
      </article>

      {bulb && (
        <>
          <EditNameModal isOpen={modals.edit} onClose={() => toggleModal('edit')} />
          <DeleteDialog
            isOpen={modals.delete}
            onClose={() => toggleModal('delete')}
            title={t('home.delete.title')}
            description={`${t('home.delete.message')} "${bulb.name}"?`}
            onConfirm={() => alert('WIP')}
          />
        </>
      )}

      <AddDeviceModal isOpen={modals.ip} onClose={() => toggleModal('ip')} />
    </section>
  )
}
