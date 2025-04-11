export type ModalType = 'edit' | 'delete' | 'ip'

export interface MenuItemType {
  label: string
  icon: JSX.Element
  onClick: () => void
}

export interface HomeModalState {
  edit: boolean
  delete: boolean
  ip: boolean
}

export interface SidebarModalState {
  about: boolean
  settings: boolean
}
