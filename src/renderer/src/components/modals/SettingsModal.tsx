import Modal from '@components/ui/Modal'
import Separator from '@components/ui/Separator'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DeleteDialog from '@renderer/components/modals/DeleteDialog'
import { useBulbStore } from '@renderer/context/BulbStore'

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t, i18n } = useTranslation()
  const { deleteProfile } = useBulbStore()

  const [deleteDialog, setDeleteDialog] = useState(false)
  const handleChangeLanguage = (lang: string) => {
    if (lang === 'auto') {
      const systemLanguage = navigator.language || 'en'
      i18n.changeLanguage(systemLanguage)
    } else {
      i18n.changeLanguage(lang)
    }
  }

  const handleDeleteProfile = async () => {
    setDeleteDialog(false)
    await deleteProfile()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} maxWidth="max-w-sm">
      <div className="-mt-8">
        <Separator />
      </div>

      <article className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between">
          <p>{t('settings.theme.title')}</p>
          <select className="text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 bg-secondary-800">
            <option>{t('settings.theme.system')}</option>
            <option>{t('settings.theme.light')}</option>
            <option>{t('settings.theme.dark')}</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p>{t('settings.language.title')}</p>
          <select
            className="text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 bg-secondary-800"
            onChange={(e) => handleChangeLanguage(e.target.value)}
          >
            <option value={'auto'}>{t('settings.language.auto')}</option>
            <option value={'en'}>{t('settings.language.english')}</option>
            <option value={'es'}>{t('settings.language.spanish')}</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p>{t('settings.deleteProfile.title')}</p>
          <button
            className="text-white bg-alert font-medium rounded-lg px-8 py-2 cursor-pointer hover:bg-alert/80"
            onClick={() => setDeleteDialog(true)}
          >
            {t('settings.deleteProfile.button')}
          </button>
        </div>
      </article>

      {deleteDialog && (
        <DeleteDialog
          isOpen={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          title={t('settings.deleteProfile.title')}
          description={t('settings.deleteProfile.description')}
          onConfirm={handleDeleteProfile}
        />
      )}
    </Modal>
  )
}
