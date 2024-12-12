import { useCallback, useEffect, useState } from 'react'
import { MinimizeIcon, HideIcon, CloseIcon, PinIcon } from './icons'
import { cn } from '@/lib/utils'
import { getElectronAPI } from '@/lib/electron'

export function TitleBar() {
  const [isPinned, setIsPinned] = useState(false)
  const electron = getElectronAPI()

  useEffect(() => {
    electron.window.getPinState().then(setIsPinned)
  }, [])

  const handleMinimize = useCallback(() => {
    electron.window.minimize()
  }, [])

  const handleHide = useCallback(() => {
    electron.window.hide()
  }, [])

  const handleClose = useCallback(() => {
    electron.window.close()
  }, [])

  const handlePin = useCallback(() => {
    electron.window.togglePin()
    setIsPinned(!isPinned)
  }, [isPinned])

  return (
    <div className="flex items-center justify-between h-8 px-2 bg-background/50 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center space-x-2 app-region-drag">
        <span className="text-sm font-medium">QuickPaste</span>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={handlePin}
          className={cn(
            'p-1.5 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 app-region-no-drag',
            isPinned && 'text-primary'
          )}
        >
          <PinIcon className="w-3 h-3" />
        </button>
        <button
          onClick={handleMinimize}
          className="p-1.5 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 app-region-no-drag"
        >
          <MinimizeIcon className="w-3 h-3" />
        </button>
        <button
          onClick={handleHide}
          className="p-1.5 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 app-region-no-drag"
        >
          <HideIcon className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-md hover:bg-red-500/90 hover:text-white app-region-no-drag"
        >
          <CloseIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
