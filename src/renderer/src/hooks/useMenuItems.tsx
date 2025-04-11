import { useMemo } from 'react'
import { LuSquarePen, LuToggleLeft, LuTrash } from 'react-icons/lu'
import { MenuItemType, ModalType } from '../types/modals'

export function useBulbMenuItems(toggleBulb: () => void, toggleModal: (modal: ModalType) => void) {
  return useMemo(
    (): MenuItemType[] => [
      {
        label: 'Toggle',
        icon: <LuToggleLeft size={20} />,
        onClick: toggleBulb
      },
      {
        label: 'Change name',
        icon: <LuSquarePen size={20} />,
        onClick: () => toggleModal('edit')
      },
      {
        label: 'Delete',
        icon: <LuTrash size={20} />,
        onClick: () => toggleModal('delete')
      }
    ],
    [toggleBulb, toggleModal]
  )
}
