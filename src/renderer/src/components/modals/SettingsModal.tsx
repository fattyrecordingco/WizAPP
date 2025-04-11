import Modal from '../ui/Modal'
import Separator from '../ui/Separator'

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" maxWidth="max-w-sm">
      <div className="-mt-8">
        <Separator />
      </div>

      <article className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between">
          <p>Theme</p>
          <select className="text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 bg-secondary-800">
            <option>System</option>
            <option>Dark</option>
            <option>Light</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p>Language</p>
          <select className="text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 bg-secondary-800">
            <option>Auto-Detect</option>
            <option>English</option>
            <option>Spanish</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p>Delete profile</p>
          <button className="text-white bg-alert font-medium rounded-lg px-8 py-2 cursor-pointer hover:bg-alert/80">
            Delete
          </button>
        </div>
      </article>
    </Modal>
  )
}
