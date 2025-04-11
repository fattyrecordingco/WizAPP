import logo from '@assets/logo_sidebar.png'
import { useBulbStore } from '@renderer/context/BulbStore'
import { SidebarModalState } from '@renderer/types/modals'
import { ReactNode, useState } from 'react'
import { LuCircleHelp, LuImages, LuInfo, LuLayoutDashboard, LuSettings } from 'react-icons/lu'
import BulbShortcut from '../BulbShortcut'
import MenuLink from '../MenuLink'
import AboutModal from '../modals/AboutModal'
import SettingsModal from '../modals/SettingsModal'
import Button from './Button'
import Separator from './Separator'

export default function Sidebar() {
  const bulb = useBulbStore((state) => state.bulb)
  const [modals, setModals] = useState<SidebarModalState>({
    about: false,
    settings: false
  })

  const toggleModal = (modal: keyof SidebarModalState) => {
    setModals((prev) => ({ ...prev, [modal]: !prev[modal] }))
  }

  const renderMenuOption = (icon: ReactNode, label: string, onClick: () => void) => {
    return (
      <li>
        <Button
          className="flex w-full gap-2 items-center transition duration-200 py-2 px-4 border-none rounded-lg hover:scale-105 hover:bg-secondary cursor-pointer"
          variant="ghost"
          aria-label={label}
          onClick={onClick}
        >
          {icon}
          <span>{label}</span>
        </Button>
      </li>
    )
  }

  return (
    <aside className="bg-sidebar-bg p-4 w-56 flex flex-col min-h-screen max-h-screen fixed">
      <img src={logo} alt="Wiz logo banner" width={100} className="mx-auto" />
      <Separator />

      <div className="flex-grow-1">
        <p className="text-neutral-500 text-xs subpixel-antialiased mb-3 ps-2">Menu</p>
        <ul className="text-white flex flex-col gap-2">
          <MenuLink label="Dashboard" to="/" icon={<LuLayoutDashboard size={20} />} />
          <MenuLink label="Scenes" to="/scenes" icon={<LuImages size={20} />} />
          <MenuLink label="Information" to="/information" icon={<LuInfo size={20} />} />
        </ul>
      </div>

      {bulb && <BulbShortcut />}
      <Separator />

      <div>
        <ul className="text-white flex flex-col gap-2">
          {renderMenuOption(<LuSettings size={20} />, 'Settings', () => toggleModal('settings'))}
          {renderMenuOption(<LuCircleHelp size={20} />, 'Help', () => toggleModal('about'))}
        </ul>
      </div>

      <AboutModal isOpen={modals.about} onClose={() => toggleModal('about')} />
      <SettingsModal isOpen={modals.settings} onClose={() => toggleModal('settings')} />
    </aside>
  )
}
