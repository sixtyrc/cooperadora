import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAStatus() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('beforeinstallprompt', handleInstall)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstall)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const install = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <>
      {!online && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white shadow">
          Estás sin conexión. Podés seguir viendo el contenido guardado.
        </div>
      )}
      {installPrompt && (
        <button
          type="button"
          onClick={install}
          className="fixed bottom-5 right-5 z-[90] rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary-light"
          aria-label="Instalar Cooperadora en este dispositivo"
        >
          Instalar app
        </button>
      )}
    </>
  )
}
