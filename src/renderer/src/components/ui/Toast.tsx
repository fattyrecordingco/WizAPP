import { useBulbStore } from '@renderer/context/BulbStore'
import { ToastMessage } from '@shared/types/toastMessage'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuX } from 'react-icons/lu'

const AUTO_DISMISS_MS = 5000

function Toast({ toast }: { toast: ToastMessage }) {
  const { t } = useTranslation()
  const dismissToast = useBulbStore((s) => s.dismissToast)
  const retryDiscovery = useBulbStore((s) => s.retryDiscovery)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (toast.autoDismiss) {
      const timer = setTimeout(() => handleDismiss(), AUTO_DISMISS_MS)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [toast.id, toast.autoDismiss])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => dismissToast(toast.id), 300) // Wait for exit animation
  }

  const bgColor = {
    success: 'bg-green-600/80',
    error: 'bg-red-500/80',
    info: 'bg-blue-600/80'
  }[toast.type]

  const iconEmoji = {
    success: '✓',
    error: '!',
    info: 'ℹ'
  }[toast.type]

  return (
    <div
      className={`${bgColor} backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[400px] transition-all duration-300 ${
        isExiting
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100 animate-slide-in-right'
      }`}
    >
      <span className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
        {iconEmoji}
      </span>
      <span className="flex-1 text-sm font-medium">{t(toast.message)}</span>
      {toast.retryAction && (
        <button
          className="text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors cursor-pointer"
          onClick={() => {
            handleDismiss()
            retryDiscovery()
          }}
        >
          {t('toast.retry')}
        </button>
      )}
      <button
        className="text-white/60 hover:text-white transition-colors cursor-pointer shrink-0 p-1 rounded hover:bg-white/10"
        onClick={handleDismiss}
      >
        <LuX size={16} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useBulbStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 overflow-hidden">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
