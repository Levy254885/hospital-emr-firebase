import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    if (isIos && !isStandalone()) {
      const t = setTimeout(() => setIosHint(true), 4000)
      return () => {
        clearTimeout(t)
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setVisible(false)
    setIosHint(false)
    localStorage.setItem('pwa-install-dismissed', String(Date.now()))
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }

  if (!visible && !iosHint) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex gap-3 items-start">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Install Hospital EMR</p>
          {iosHint ? (
            <p className="text-xs text-gray-500 mt-1">
              Tap <span className="font-medium">Share</span> then{' '}
              <span className="font-medium">Add to Home Screen</span> to install on this device.
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Install the app on this phone, tablet, or computer for quick access.
            </p>
          )}
          <div className="flex gap-2 mt-3">
            {!iosHint && deferred && (
              <Button size="sm" onClick={install}>
                Install
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button type="button" onClick={dismiss} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
